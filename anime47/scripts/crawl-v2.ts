
/**
 * Manga Crawler Tool V2
 * 
 * Crawl manga data from toptruyenxi.com (Page 1-323)
 * 
 * Usage: 
 *   npx ts-node scripts/crawler-v2.ts
 */

import { StoryStatus, MigrationStatus } from '@prisma/client';
import { prisma } from '../src/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import * as cheerio from 'cheerio';


// Configuration
const CONFIG = {
  BASE_URL: 'https://www.toptruyenxi.com/tim-truyen',
  START_PAGE: 1,
  END_PAGE: 323,
  TARGET_DOMAIN: '', // <--- User fill domain here (e.g., 'cdn.example.com')
  DELAY_BETWEEN_REQUESTS: 2000, // 2 seconds between requests to be safe
  DELAY_BETWEEN_CHAPTERS: 1000, // 1 second between chapters
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  TEST_MODE: process.argv.includes('--test'),
  TEST_LIMIT_STORIES: (() => {
    const testIndex = process.argv.indexOf('--test');
    if (testIndex !== -1 && testIndex + 1 < process.argv.length) {
      const limit = parseInt(process.argv[testIndex + 1]);
      return !isNaN(limit) ? limit : 1;
    }
    return 1;
  })(),
  TEST_LIMIT_CHAPTERS: (() => {
    const testIndex = process.argv.indexOf('--test');
    if (testIndex !== -1 && testIndex + 2 < process.argv.length) {
      const limit = parseInt(process.argv[testIndex + 2]);
      return !isNaN(limit) ? limit : 1;
    }
    return 1;
  })(),
};

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// HTTP request utility with redirect handling
async function fetchUrl(url: string, maxRedirects: number = 5): Promise<string> {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      reject(new Error('Too many redirects'));
      return;
    }
    
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': CONFIG.USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 30000,
    };
    
    const request = protocol.get(url, options, (response) => {
      // Handle redirects
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          const fullRedirectUrl = redirectUrl.startsWith('http') 
            ? redirectUrl 
            : new URL(redirectUrl, url).toString();
          
          fetchUrl(fullRedirectUrl, maxRedirects - 1).then(resolve).catch(reject);
          return;
        }
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => resolve(data));
      response.on('error', reject);
    });
    
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Interfaces
interface ChapterLink {
  url: string;
  title: string;
  chapterNumber: string;
}

interface ChapterImage {
  src: string;
  alt?: string;
}

interface ChapterData {
  chapterNumber: string;
  title: string;
  images: ChapterImage[];
  sourceUrl: string;
}

interface MangaData {
  title: string;
  author: string | null;
  genres: string[];
  description: string | null;
  chapterCount: number;
  coverImageUrl: string | null;
  sourceUrl: string;
  chapterLinks: ChapterLink[];
}

// Extract story links from listing page
function extractStoryLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();
  
  // Selector: .item-manga > .item > .clearfix > .image-item > a
  $('.item-manga .item .clearfix .image-item a').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
      links.add(fullUrl);
    }
  });
  
  return Array.from(links);
}

// Extract manga data from detail page
function extractMangaData(html: string, sourceUrl: string): MangaData | null {
  try {
    const $ = cheerio.load(html);
    
    // Title: .title-manga
    const title = $('.title-manga').text().trim();
    if (!title) {
        console.log('⚠️ No title found');
        return null;
    }

    // Cover: .image-info > img.image-comic
    const coverRaw = $('.image-info img.image-comic').attr('src') || '';
    let coverImageUrl: string | null = null;
    if (coverRaw) {
        // 1. Lấy đường dẫn đầy đủ
        coverImageUrl = coverRaw.startsWith('http') ? coverRaw : new URL(coverRaw, sourceUrl).toString();
    }

    // Author: .author > .detail-info
    const author = $('.author .detail-info').text().trim() || 'Unknown';

    // Genres: .category > .detail-info (cat-detail > a)
    const genres: string[] = [];
    $('.category .detail-info .cat-detail a').each((_, el) => {
        const txt = $(el).text().trim();
        if (txt) genres.push(txt);
    });

    // Summary: .summary-content > .detail-summary
    const description = $('.summary-content .detail-summary').html()?.trim() || '';

    // Chapters: .list-chapter > nav > ul > li > .chapters > a
    const chapterLinks: ChapterLink[] = [];
    $('.list-chapter nav ul li .chapters a').each((_, el) => {
        const $link = $(el);
        const $li = $link.closest('li');
        
        // Skip hidden chapters
        // Check inline style or class if needed (usually inline style="display:none")
        const style = $li.attr('style') || '';
        if (style.includes('display: none') || style.includes('display:none')) {
            return;
        }

        const href = $link.attr('href');
        const chapterTitle = $link.text().trim();
        
        if (href) {
            const fullUrl = href.startsWith('http') ? href : new URL(href, sourceUrl).toString();
            
            // Extract number from title or url
            // Enhanced Regex: Support 'chap', 'tập', or just numbers
            const titleNumMatch = chapterTitle.match(/(?:chapter|chap|chương|ch\.?|tập)\s*(\d+(?:\.\d+)?)/i);
            const urlNumMatch = fullUrl.match(/(?:chapter|chap|chuong)-(\d+(?:-\d+)?)/i);
            
            // Fallback: Check if title is JUST a number (e.g. "100")
            const simpleNumMatch = chapterTitle.match(/^(\d+(?:\.\d+)?)$/);

            let chapterNumber = '';
            if (titleNumMatch) chapterNumber = titleNumMatch[1];
            else if (urlNumMatch) chapterNumber = urlNumMatch[1];
            else if (simpleNumMatch) chapterNumber = simpleNumMatch[1];
            
            if (!chapterNumber) {
                console.warn(`      ⚠️ Could not parse number for: "${chapterTitle}" - URL: ${fullUrl}. Skipping fallback to avoid mismatch.`);
                return; // Skip this link instead of assigning wrong number
            }

            // Standardize format to "Chapter X"
            // The user wants: "Chapter 1", "Chapter 1.1", removing any suffix like ": Title"
            const standardizedTitle = `Chapter ${chapterNumber}`;

            chapterLinks.push({
                url: fullUrl,
                title: standardizedTitle,
                chapterNumber
            });
        }
    });

    // Reverse chapters to process from 1 to N if they are listed N to 1
    // Usually sites list newest first. We want to insert consistent data.
    // The user said "Crawl tuần tự" (sequentially). If we want logical order 1,2,3 we might want to reverse.
    // But typically order of insertion doesn't matter for display if we sort by number.
    // Let's keep original order or process? 
    // The previous crawler didn't reverse explicitly but it pushed to array. 
    // Let's just return as found.

    return {
        title,
        author,
        genres,
        description,
        chapterCount: chapterLinks.length,
        coverImageUrl,
        sourceUrl,
        chapterLinks
    };

  } catch (error) {
    console.error(`Error extracting manga data: ${error}`);
    return null;
  }
}

// Extract chapter images
function extractChapterImages(html: string, sourceUrl: string): ChapterImage[] {
  try {
    const $ = cheerio.load(html);
    const images: ChapterImage[] = [];

    // Selector: .list-image-detail > .page-chapter > img
    $('.list-image-detail .page-chapter img').each((_, el) => {
        const srcRaw = $(el).attr('src') || $(el).attr('data-src') || '';
        const alt = $(el).attr('alt') || '';
        
        if (srcRaw) {
            let fullUrl = srcRaw.startsWith('http') ? srcRaw : new URL(srcRaw, sourceUrl).toString();

            // Replace domain if TARGET_DOMAIN is set
            if (CONFIG.TARGET_DOMAIN) {
                fullUrl = fullUrl.replace(/https?:\/\/[^\/]+/, `https://${CONFIG.TARGET_DOMAIN}`);
            }

            images.push({ src: fullUrl, alt });
        }
    });

    return images;
  } catch (error) {
    console.error(`Error extracting chapter images: ${error}`);
    return [];
  }
}

// Save chapters data
async function saveChaptersData(chapters: ChapterData[], storySlug: string, storyId: number): Promise<void> {
    const storyDir = path.join(process.cwd(), 'public', 'uploads', 'stories', storySlug);
    if (!fs.existsSync(storyDir)) {
      fs.mkdirSync(storyDir, { recursive: true });
    }
    
    const jsonPath = path.join(storyDir, 'chapters.json');
    const relativeJsonPath = `/uploads/stories/${storySlug}/chapters.json`;
    
    // Save chapters JSON file
    // We append or overwrite? If we filtered inside processStory, `chapters` only has NEW chapters.
    // If we overwrite `chapters.json` with ONLY new chapters, we lose old chapters metadata in JSON.
    // Ideally we should read existing JSON, merge, and save.
    // But DB is the source of truth. The JSON file is backup/legacy.
    // As per user request "chap nào có rồi thì bỏ qua", we are modifying DB insertion mostly.
    // Let's read existing JSON if exists to preserve history in JSON file.
    let allChapters = [...chapters];
    if (fs.existsSync(jsonPath)) {
        try {
            const existingJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
            if (Array.isArray(existingJson)) {
                // Merge logic: Add new chapters to existing list
                // Avoid duplicates in JSON
                const existingMap = new Map(existingJson.map((c: any) => [c.chapterNumber, c]));
                for (const c of chapters) {
                    existingMap.set(c.chapterNumber, c);
                }
                allChapters = Array.from(existingMap.values());
                // Sort by chapter number desc or asc?
                // Let's sort by chapter number desc (newest first)
                allChapters.sort((a, b) => parseFloat(b.chapterNumber) - parseFloat(a.chapterNumber));
            }
        } catch (e) {
            console.warn('Failed to parse existing chapters.json', e);
        }
    }
    
    fs.writeFileSync(jsonPath, JSON.stringify(allChapters, null, 2), 'utf-8');
    


    // Batch create/update in DB
    for (const chapter of chapters) {
        try {
            const chapterSlug = generateSlug(chapter.title) || `chapter-${chapter.chapterNumber}`;
            
            const existing = await prisma.chapter.findUnique({
                where: {
                    storyId_chapterNumber: {
                        storyId,
                        chapterNumber: parseFloat(chapter.chapterNumber) || 0,
                    }
                }
            });

            if (existing) {
                await prisma.chapter.update({
                    where: { id: existing.id },
                    data: {
                        title: chapter.title,
                        slug: chapterSlug,
                        filePath: relativeJsonPath, 
                        sourceUrl: chapter.sourceUrl,
                        updatedAt: new Date()
                    }
                });
            } else {
                await prisma.chapter.create({
                    data: {
                        storyId,
                        title: chapter.title,
                        slug: chapterSlug,
                        chapterNumber: parseFloat(chapter.chapterNumber) || 0, // Changed to parseFloat to handle 1.5
                        filePath: relativeJsonPath,
                        sourceUrl: chapter.sourceUrl,
                        status: 'PUBLISH',
                        publishedAt: new Date()
                    }
                });
            }
        } catch (e) {
            console.error(`Failed to save chapter ${chapter.chapterNumber}: ${e}`);
        }
    }
}

// Helpers
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processStory(url: string) {
    console.log(`\n  Processing Story: ${url}`);
    
    try {
        const html = await fetchUrl(url);
        const data = extractMangaData(html, url);
        
        if (!data) return;
        
        console.log(`    Title: ${data.title}`);
        console.log(`    Chapters: ${data.chapterCount}`);
        
        // Save Story to DB
        const slug = generateSlug(data.title);
        
        // Handle Genres
        const genreIds: number[] = [];
        for (const name of data.genres) {
            const gSlug = generateSlug(name);
            if (!gSlug) continue;
            
            let genre = await prisma.genre.findUnique({ where: { slug: gSlug } });
            if (!genre) {
                genre = await prisma.genre.create({ data: { name, slug: gSlug } });
            }
            genreIds.push(genre.id);
        }
        
        // Upsert Story
        let story = await prisma.story.findUnique({ where: { slug } });
        if (story) {
            console.log(`    Story exists, updating...`);
            story = await prisma.story.update({
                where: { slug },
                data: {
                    title: data.title,
                    description: data.description,
                    authorName: data.author,
                    coverImage: data.coverImageUrl, // Remote URL
                    totalChapters: data.chapterCount,
                    updatedAt: new Date()
                }
            });
        } else {
             console.log(`    Creating new story...`);
             story = await prisma.story.create({
                 data: {
                     title: data.title,
                     slug,
                     description: data.description,
                     authorName: data.author,
                     coverImage: data.coverImageUrl, // Remote URL
                     totalChapters: data.chapterCount,
                     status: StoryStatus.PUBLISH,
                     sourceUrl: data.sourceUrl,
                     migrationStatus: MigrationStatus.PENDING,
                     genres: {
                         create: genreIds.map(id => ({
                             genre: { connect: { id } }
                         }))
                     }
                 }
             });
        }
        
        // Process Chapters
        const chaptersData: ChapterData[] = [];
        
        console.log(`    Total links found: ${data.chapterLinks.length}`);
        
        let chaptersToProcess = data.chapterLinks;
        
        // --- ADDED FIX: Filter out duplicate chapters, prefer "Chapter X" format ---
        const uniqueChapters = new Map<string, ChapterLink>();
        
        for (const link of chaptersToProcess) {
             const key = link.chapterNumber; 
             // Logic: If key exists, only overwrite if current title looks "better" (e.g. contains "Chapter")
             // Currently, just keep the first one found or last one found?
             // The list from extractMangaData is pushed in order of appearance.
             // Usually site lists: Chap 10, Chap 9... 
             // If we have "Chapter 10" and "10", we want "Chapter 10".
             
             if (!uniqueChapters.has(key)) {
                 uniqueChapters.set(key, link);
             } else {
                 const existing = uniqueChapters.get(key)!;
                 // If new one has "Chapter" in title and old one doesn't, swap
                 if (link.title.toLowerCase().includes('chapter') && !existing.title.toLowerCase().includes('chapter')) {
                     uniqueChapters.set(key, link);
                 }
             }
        }
        
        chaptersToProcess = Array.from(uniqueChapters.values());
        console.log(`    Unique chapters to process: ${chaptersToProcess.length}`);
        // --------------------------------------------------------------------------

                if (CONFIG.TEST_MODE) {
                  console.log(`    🧪 TEST MODE: Processing only ${CONFIG.TEST_LIMIT_CHAPTERS} chapters`);
                  chaptersToProcess = chaptersToProcess.slice(0, CONFIG.TEST_LIMIT_CHAPTERS);
                }
        
                for (let i = 0; i < chaptersToProcess.length; i++) {
                    const link = chaptersToProcess[i];
                    
                    try {
                        // Check if chapter already exists in DB to skip crawling
                        const existingChapter = await prisma.chapter.findUnique({
                            where: {
                                storyId_chapterNumber: {
                                    storyId: story.id,
                                    chapterNumber: parseInt(link.chapterNumber) || 0,
                                }
                            }
                        });
                        
                        if (existingChapter) {
                            console.log(`      ⏭️ Skipping [${link.chapterNumber}] (Already exists)`);
                            continue;
                        }

                        // Ensure we are crawling based on the LINK URL, not inferring
                        console.log(`      Processing [${link.chapterNumber}] ${link.title}`);
                        const chHtml = await fetchUrl(link.url);
                        const images = extractChapterImages(chHtml, link.url);
                        console.log(`      Found ${images.length} images`);
                        
                        // Double check if images are valid?
                        if (images.length === 0) {
                             console.log(`      ⚠️ Warning: 0 images found for ${link.title}`);
                        }
                        
                        chaptersData.push({
                            chapterNumber: link.chapterNumber, // This ensures the number matches the link
                            title: link.title,
                            images,
                            sourceUrl: link.url
                        });
                        
                        await delay(CONFIG.DELAY_BETWEEN_CHAPTERS);
                        
                    } catch (err) {
                        console.error(`      Failed chapter ${link.title}: ${err}`);
                    }
                    
                     // Progress indicator
                     process.stdout.write('.');
                }
                
                // Save all chapters for this story
                if (chaptersData.length > 0) {
                    await saveChaptersData(chaptersData, slug, story.id);
                    console.log(`\n    ✅ Saved ${chaptersData.length} new chapters.`);
                }
        
    } catch (error) {
        console.error(`  ❌ Error processing story ${url}: ${error}`);
    }
}

async function main() {
    console.log('🚀 Starting V2 Crawler');
    console.log(`TARGET: ${CONFIG.BASE_URL}`);
    console.log(`PAGES: ${CONFIG.START_PAGE} to ${CONFIG.END_PAGE}`);
    
    let storiesProcessed = 0;
    
    for (let page = CONFIG.START_PAGE; page <= CONFIG.END_PAGE; page++) {
        if (CONFIG.TEST_MODE && storiesProcessed >= CONFIG.TEST_LIMIT_STORIES) break;

        console.log(`\n📄 Processing Listing Page ${page}...`);
        const url = `${CONFIG.BASE_URL}?sort=2&page=${page}`;
        
        try {
            const html = await fetchUrl(url);
            const storyLinks = extractStoryLinks(html, url);
            console.log(`  Found ${storyLinks.length} stories.`);
            
            for (const storyUrl of storyLinks) {
                if (CONFIG.TEST_MODE && storiesProcessed >= CONFIG.TEST_LIMIT_STORIES) break;

                await processStory(storyUrl);
                storiesProcessed++;
                
                // Wait between stories
                await delay(CONFIG.DELAY_BETWEEN_REQUESTS);
            }
            
        } catch (error) {
            console.error(`Failed to process page ${page}: ${error}`);
        }
    }
    
    await prisma.$disconnect();
    console.log('🎉 Crawl complete!');
}

main().catch(console.error);
