/**
 * Anime47 Crawler Script
 * 
 * Crawl anime data from anime47.tv via sitemaps
 * 
 * Sitemaps:
 *   - https://anime47.tv/sitemap_index.xml (index)
 *   - https://anime47.tv/category-sitemap.xml (genres/categories)
 *   - https://anime47.tv/post-sitemap1.xml (anime pages)
 *   - https://anime47.tv/post-sitemap2.xml
 *   - https://anime47.tv/post-sitemap3.xml
 * 
 * Usage:
 *   npx tsx scripts/crawl-anime.ts                    # Full crawl
 *   npx tsx scripts/crawl-anime.ts --test 10          # Test 10 anime
 *   npx tsx scripts/crawl-anime.ts --test 5           # Test 5 anime
 *   npx tsx scripts/crawl-anime.ts --genres-only      # Only crawl genres
 *   npx tsx scripts/crawl-anime.ts --stories-only     # Only crawl stories (skip genres)
 */

import axios, { AxiosInstance } from 'axios'
import { load } from 'cheerio'
import { parseString } from 'xml2js'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  SITEMAP_INDEX_URL: 'https://anime47.tv/sitemap_index.xml',
  SOURCE_DOMAIN: 'anime47.tv',
  
  DELAY_BETWEEN_REQUESTS: 1500,  // ms between story crawls
  DELAY_BETWEEN_GENRES: 500,     // ms between genre crawls
  BATCH_SIZE: 3,                 // concurrent story crawls per batch
  TIMEOUT: 15000,                // HTTP timeout
  MAX_RETRIES: 3,                // retry failed requests

  // CLI flags
  TEST_MODE: process.argv.includes('--test'),
  TEST_LIMIT: (() => {
    const idx = process.argv.indexOf('--test')
    if (idx !== -1 && idx + 1 < process.argv.length) {
      const limit = parseInt(process.argv[idx + 1])
      return !isNaN(limit) ? limit : 10
    }
    return 10
  })(),
  GENRES_ONLY: process.argv.includes('--genres-only'),
  STORIES_ONLY: process.argv.includes('--stories-only'),
  FORCE_UPDATE: process.argv.includes('--force'),
}

// ═══════════════════════════════════════════════════════════════
// PRISMA CLIENT
// ═══════════════════════════════════════════════════════════════

const prisma = new PrismaClient({
  log: ['error'],
})

// ═══════════════════════════════════════════════════════════════
// HTTP CLIENT
// ═══════════════════════════════════════════════════════════════

const httpClient: AxiosInstance = axios.create({
  timeout: CONFIG.TIMEOUT,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8',
  },
})

async function fetchWithRetry(url: string, retries = CONFIG.MAX_RETRIES): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await httpClient.get(url, {
        responseType: 'text',
      })
      return response.data
    } catch (error: any) {
      log('warn', `Fetch failed (${i + 1}/${retries}): ${url} - ${error.message}`)
      if (i < retries - 1) {
        await delay(CONFIG.DELAY_BETWEEN_REQUESTS * (i + 1))
      } else {
        throw error
      }
    }
  }
  throw new Error('Should not reach here')
}

// ═══════════════════════════════════════════════════════════════
// IMAGE DOWNLOAD
// ═══════════════════════════════════════════════════════════════

const BASE_UPLOAD_DIR = path.join(process.cwd(), 'public', 'upload', 'image')

function getMonthlyDir(): { dir: string; urlPath: string } {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = String(now.getFullYear())
  const dir = path.join(BASE_UPLOAD_DIR, month, year)
  const urlPath = `/upload/image/${month}/${year}`

  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch (err: any) {
      log('error', `Could not create directory ${dir}: ${err.message}`)
    }
  }

  return { dir, urlPath }
}

function getExtension(imageUrl: string): string {
  try {
    const urlPath = new URL(imageUrl).pathname
    const ext = path.extname(urlPath)
    return ext || '.webp'
  } catch {
    return '.webp'
  }
}

async function downloadImage(imageUrl: string): Promise<string | null> {
  try {
    if (!imageUrl || imageUrl.includes('data:image') || imageUrl.includes('svg+xml')) {
      return null
    }

    const hash = crypto.createHash('md5').update(imageUrl).digest('hex')
    const ext = getExtension(imageUrl)
    const hashFilename = `${hash}${ext}`

    // Check legacy flat directory
    const oldFilepath = path.join(BASE_UPLOAD_DIR, hashFilename)
    if (fs.existsSync(oldFilepath)) {
      return `/upload/image/${hashFilename}`
    }

    // Check monthly directory
    const { dir, urlPath } = getMonthlyDir()
    
    // Try to get original filename
    let originalName = ''
    try {
      const urlObj = new URL(imageUrl)
      originalName = path.basename(urlObj.pathname).split('?')[0].split('#')[0]
      // Replace non-ascii/special chars just in case
      originalName = originalName.replace(/[^\w\.\-]/g, '_')
    } catch (e) {}

    const filename = (originalName && originalName.length > 5 && originalName.includes('.')) 
      ? originalName 
      : hashFilename

    const filepath = path.join(dir, filename)
    const hashFilepath = path.join(dir, hashFilename)

    // If either version already exists, return it
    if (fs.existsSync(filepath)) {
      return `${urlPath}/${filename}`
    }
    if (fs.existsSync(hashFilepath)) {
      return `${urlPath}/${hashFilename}`
    }

    // Download
    const response = await httpClient.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'Referer': 'https://anime47.tv/',
      },
    })

    // Verify we didn't get an HTML Cloudflare page or dummy wrapper
    const contentType = response.headers['content-type'] || ''
    if (contentType.includes('text/html')) {
      log('error', `Failed to download image (Received HTML instead of image): ${imageUrl}`)
      return null
    }

    try {
      fs.writeFileSync(filepath, response.data)
    } catch (writeErr: any) {
      if (writeErr.code === 'EACCES') {
        log('error', `Permission denied: ${filepath}. Please run 'sudo chown -R 777 public/upload' or similar on server.`)
      }
      throw writeErr
    }

    const localUrl = `${urlPath}/${filename}`
    log('success', `Image saved: ${localUrl}`)
    return localUrl
  } catch (error: any) {
    if (error.code === 'EACCES') {
      log('error', `Failed to save image due to permissions: ${imageUrl} - ${error.message}`)
    } else {
      log('error', `Failed to download image: ${imageUrl} - ${error.message}`)
    }
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function slugify(text: string): string {
  const vietnameseMap: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A', 'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
    'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
    'Đ': 'D',
  }

  let str = text.toString().toLowerCase().trim()
  for (const key in vietnameseMap) {
    str = str.replace(new RegExp(key, 'g'), vietnameseMap[key])
  }
  return str
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

function cleanText(text: string | undefined | null): string {
  if (!text) return ''
  return text.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim()
}

function parseNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value
  if (!value) return 0
  const parsed = parseInt(value.toString().replace(/[^\d]/g, ''))
  return isNaN(parsed) ? 0 : parsed
}

// ═══════════════════════════════════════════════════════════════
// LOGGER
// ═══════════════════════════════════════════════════════════════

const colors = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  success: '\x1b[32m',
  reset: '\x1b[0m',
}

const LOG_FILE = path.join(process.cwd(), 'crawl.log');

function log(level: 'info' | 'warn' | 'error' | 'success', message: string) {
  const timestamp = new Date().toISOString()
  const color = colors[level]
  const consoleMsg = `${color}${timestamp} [${level.toUpperCase()}]${colors.reset} ${message}`;

  console.log(consoleMsg);

  if (level === 'error') {
    const fileMsg = `${timestamp} [${level.toUpperCase()}] ${message}\n`;
    try {
      fs.appendFileSync(LOG_FILE, fileMsg);
    } catch (e) {
      console.error(`Failed to write to log file:`, e);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// XML PARSER
// ═══════════════════════════════════════════════════════════════

function parseXml(xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(xml, { explicitArray: false }, (err: Error | null, result: any) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

interface SitemapUrl {
  loc: string
  lastmod?: string
}

async function parseSitemapIndex(xml: string): Promise<SitemapUrl[]> {
  const parsed = await parseXml(xml)
  if (!parsed.sitemapindex?.sitemap) return []

  const sitemaps = Array.isArray(parsed.sitemapindex.sitemap)
    ? parsed.sitemapindex.sitemap
    : [parsed.sitemapindex.sitemap]

  return sitemaps.map((s: any) => ({ loc: s.loc, lastmod: s.lastmod }))
}

async function parseSitemap(xml: string): Promise<SitemapUrl[]> {
  const parsed = await parseXml(xml)
  if (!parsed.urlset?.url) return []

  const urls = Array.isArray(parsed.urlset.url)
    ? parsed.urlset.url
    : [parsed.urlset.url]

  return urls.map((u: any) => ({ loc: u.loc, lastmod: u.lastmod }))
}

// ═══════════════════════════════════════════════════════════════
// SITEMAP TYPE DETECTION
// ═══════════════════════════════════════════════════════════════

type SitemapType = 'genre' | 'story' | 'page' | 'local' | 'unknown'

function detectSitemapType(sitemapUrl: string): SitemapType {
  const lower = sitemapUrl.toLowerCase()
  if (lower.includes('category-sitemap')) return 'genre'
  if (lower.includes('post-sitemap')) return 'story'
  if (lower.includes('page-sitemap')) return 'page'
  if (lower.includes('local-sitemap')) return 'local'
  return 'unknown'
}

// ═══════════════════════════════════════════════════════════════
// GENRE CRAWLING
// ═══════════════════════════════════════════════════════════════

async function crawlGenre(url: string): Promise<void> {
  try {
    const slug = extractSlugFromUrl(url)
    if (!slug) {
      log('warn', `Invalid genre URL: ${url}`)
      return
    }

    const html = await fetchWithRetry(url)
    const $ = load(html)

    const name = $('h1').first().text().trim()
    if (!name) {
      log('warn', `No H1 found for genre: ${url}`)
      return
    }

    await prisma.genres.upsert({
      where: { slug },
      create: { name, slug, sourceUrl: url },
      update: { name, sourceUrl: url },
    })

    log('success', `✓ Genre: ${name} (${slug})`)
  } catch (error: any) {
    log('error', `Failed genre: ${url} - ${error.message}`)
  }
}

function extractSlugFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.pathname.replace(/^\/|\/$/g, '')
  } catch {
    return ''
  }
}

// ═══════════════════════════════════════════════════════════════
// STORY DETAIL CRAWLING
// ═══════════════════════════════════════════════════════════════

interface AnimeDetailRaw {
  title: string
  alternativeName?: string
  description?: string
  coverImageUrl?: string
  releaseYear?: string
  directors: Array<{ name: string; url: string }>
  actors: Array<{ name: string; url: string }>
  genres: string[]
  keywords: string[]
  quality?: string
  language?: string
  duration?: string
  rating?: string
  episodes: Array<{ title: string; url: string }>
  sourceUrl: string
}

async function crawlAnimeDetail(url: string): Promise<void> {
  try {
    log('info', `Crawling: ${url}`)

    const html = await fetchWithRetry(url)
    const $ = load(html)

    // ─── Title ───
    const title = $('h1.movie-title-detail').text().trim()
    if (!title) {
      log('warn', `No title found: ${url}`)
      return
    }

    // Check title against blacklist (gambling, spam)
    const blacklist = ['rikvip', 'hitclub', 'game bài', 'cá cược', 'cá độ', 'nhà cái', 'link vào', 'giới thiệu rikvip', 'giới thiệu hitclub', 'nổ hũ', 'bắn cá', 'tài xỉu', 'soi cầu']
    const isBlacklisted = blacklist.some(word => title.toLowerCase().includes(word))
    if (isBlacklisted) {
      log('warn', `Skipping blacklisted content: ${title}`)
      return
    }

    const alternativeName = $('h2.movie-original-title').text().trim()
    
    // ─── Description ───
    const description = cleanText($('.content-detail .justify-text').text().trim())

    // ─── Cover Image ───
    const coverImageUrl = 
      $('.movie-box-img img').attr('data-lazy-src') ||
      $('.movie-box-img img').attr('data-src') ||
      $('.movie-box-img img').attr('src') || undefined

    // ─── Parse info table ───
    let releaseYear: string | undefined
    const directors: Array<{ name: string; url: string }> = []
    const actors: Array<{ name: string; url: string }> = []
    const genres: string[] = []
    const keywords: string[] = []
    let quality: string | undefined
    let language: string | undefined
    let duration: string | undefined

    $('.movie-info-table tr').each((_, row) => {
      const $row = $(row)
      const headerText = $row.find('th').text().trim()
      const $td = $row.find('td')

      if (headerText.includes('Năm phát hành')) {
        releaseYear = $td.find('a').text().trim() || $td.text().trim()
      }
      else if (headerText.includes('Đạo diễn')) {
        $td.find('a').each((_, el) => {
          const $el = $(el)
          directors.push({
            name: $el.text().trim(),
            url: $el.attr('href') || '',
          })
        })
      }
      else if (headerText.includes('Diễn viên')) {
        $td.find('a').each((_, el) => {
          const $el = $(el)
          actors.push({
            name: $el.text().trim(),
            url: $el.attr('href') || '',
          })
        })
      }
      else if (headerText.includes('Thể loại')) {
        $td.find('a').each((_, el) => {
          const text = $(el).text().trim()
          if (text) genres.push(text)
        })
      }
      else if (headerText.includes('Từ khóa')) {
        $td.find('a').each((_, el) => {
          const text = $(el).text().trim()
          if (text) keywords.push(text)
        })
      }
    })

    // ─── Quality, Language, Duration ───
    $('.movie-info__stats .stat-item').each((_, el) => {
      const $el = $(el)
      const text = $el.find('span').text().trim()

      if ($el.find('.icon-play').length > 0 || $el.find('i[class*="play"]').length > 0) {
        quality = text
      } else if ($el.find('.icon-globe').length > 0 || $el.find('i[class*="globe"]').length > 0) {
        language = text
      } else if ($el.find('.icon-clock').length > 0 || $el.find('i[class*="clock"]').length > 0) {
        duration = text
      }
    })

    // ─── Rating ───
    const ratingText = $('.rating-avg').text().trim()

    // ─── Episodes ───
    const episodes: Array<{ title: string; url: string }> = []
    $('.episodes-grid a.episode-item, .list-chapter a, .server-ep a').each((_, el) => {
      const $el = $(el)
      const epTitle = $el.find('.episode-number').text().trim() || $el.text().trim()
      const epUrl = $el.attr('href')
      if (epUrl) {
        episodes.push({ title: epTitle, url: epUrl })
      }
    })

    // ─── Filter missing content ───
    if (!coverImageUrl && episodes.length === 0) {
      log('warn', `Skipping empty record (no image & no video): ${title}`)
      return
    }
    
    // Check if image is obviously broken/placeholder
    if (coverImageUrl && (coverImageUrl.includes('placeholder') || coverImageUrl.includes('default'))) {
      if (episodes.length === 0) {
          log('warn', `Skipping record with placeholder image and no video: ${title}`)
          return
      }
    }

    const rawData: AnimeDetailRaw = {
      title,
      alternativeName,
      description,
      coverImageUrl,
      releaseYear,
      directors,
      actors,
      genres,
      keywords,
      quality,
      language,
      duration,
      rating: ratingText,
      episodes,
      sourceUrl: url,
    }

    // ═══════════════════════════════════════
    // SAVE TO DATABASE
    // ═══════════════════════════════════════

    const slug = slugify(title)

    // ─── Download cover image ───
    let localCoverUrl: string | null = null
    if (coverImageUrl) {
      const existingStoryBySlug = await prisma.stories.findUnique({
        where: { slug }
      })

      if (existingStoryBySlug?.coverImage && (existingStoryBySlug.coverImage.startsWith('/') || !existingStoryBySlug.coverImage.startsWith('http'))) {
        localCoverUrl = existingStoryBySlug.coverImage;
      } else {
        localCoverUrl = await downloadImage(coverImageUrl)
      }
    }

    // ─── Process Directors → authors table ───
    let authorId: string | undefined
    if (directors.length > 0) {
      // Lưu director đầu tiên làm author chính
      const firstDir = directors[0]
      const dirSlug = slugify(firstDir.name)
      if (dirSlug) {
        const author = await prisma.authors.upsert({
          where: { slug: dirSlug },
          create: {
            name: firstDir.name,
            slug: dirSlug,
            sourceUrl: firstDir.url,
          },
          update: {
            name: firstDir.name,
            sourceUrl: firstDir.url,
          },
        })
        authorId = author.id
      }
    }

    // ─── Process Actors → actors table ───
    const actorIds: string[] = []
    for (const actor of actors) {
      const actorSlug = slugify(actor.name)
      if (!actorSlug) continue

      const dbActor = await prisma.actors.upsert({
        where: { slug: actorSlug },
        create: {
          name: actor.name,
          slug: actorSlug,
          sourceUrl: actor.url,
        },
        update: {
          name: actor.name,
          sourceUrl: actor.url,
        },
      })
      actorIds.push(dbActor.id)
    }

    // ─── Process Genres ───
    const genreIds: string[] = []
    for (const genreName of genres) {
      const gSlug = slugify(genreName)
      if (!gSlug) continue

      // Tìm hoặc tạo mới genre
      const genre = await prisma.genres.upsert({
        where: { slug: gSlug },
        create: { name: genreName, slug: gSlug },
        update: { name: genreName },
      })
      genreIds.push(genre.id)
    }

    // ─── Process Tags (Keywords) ───
    const tagIds: string[] = []
    for (const keyword of keywords) {
      const tSlug = slugify(keyword)
      if (!tSlug) continue

      const tag = await prisma.tags.upsert({
        where: { slug: tSlug },
        create: { name: keyword, slug: tSlug },
        update: { name: keyword },
      })
      tagIds.push(tag.id)
    }

    // ─── Upsert Story ───
    const storyData = {
      title,
      slug,
      description: description || undefined,
      coverImage: localCoverUrl || coverImageUrl || undefined,
      thumbnail: localCoverUrl || coverImageUrl || undefined,
      status: 'PUBLISH',
      sourceUrl: url,
      authorId,
      alternativeName: alternativeName || undefined,
      releaseYear: parseNumber(releaseYear) || undefined,
      director: directors.map(d => d.name).join(', ') || undefined,
      cast: actors.map(a => a.name).join(', ') || undefined,
      duration: duration || undefined,
      quality: quality || undefined,
      language: language || undefined,
      keywords: keywords.join(', ') || undefined,
      metaJson: rawData as any,
    }

    const story = await prisma.stories.upsert({
      where: { slug },
      create: storyData,
      update: {
        title: storyData.title,
        description: storyData.description,
        coverImage: storyData.coverImage,
        thumbnail: storyData.thumbnail,
        authorId: storyData.authorId,
        alternativeName: storyData.alternativeName,
        releaseYear: storyData.releaseYear,
        director: storyData.director,
        cast: storyData.cast,
        duration: storyData.duration,
        quality: storyData.quality,
        language: storyData.language,
        keywords: storyData.keywords,
        metaJson: storyData.metaJson,
      },
    })

    // ─── Link Genres ───
    if (genreIds.length > 0) {
      await prisma.story_genres.deleteMany({ where: { storyId: story.id } })
      await prisma.story_genres.createMany({
        data: genreIds.map(genreId => ({ storyId: story.id, genreId })),
        skipDuplicates: true,
      })
    }

    // ─── Link Actors ───
    if (actorIds.length > 0) {
      await prisma.story_actors.deleteMany({ where: { storyId: story.id } })
      await prisma.story_actors.createMany({
        data: actorIds.map(actorId => ({ storyId: story.id, actorId })),
        skipDuplicates: true,
      })
    }

    // ─── Link Tags ───
    if (tagIds.length > 0) {
      await prisma.story_tags.deleteMany({ where: { storyId: story.id } })
      await prisma.story_tags.createMany({
        data: tagIds.map(tagId => ({ storyId: story.id, tagId })),
        skipDuplicates: true,
      })
    }

    // ─── Save Episodes (Chapters) ───
    if (episodes.length > 0) {
      log('info', `  Found ${episodes.length} episodes`)

      for (let i = 0; i < episodes.length; i++) {
        const ep = episodes[i]
        if (!ep.url) continue

        const chapterSlug = slugify(ep.title) || `tap-${i + 1}`

        // Check if chapter already exists
        const existingChapter = await prisma.chapters.findUnique({
          where: {
            storyId_slug: {
              storyId: story.id,
              slug: chapterSlug,
            },
          },
        })

        if (existingChapter) {
          // Update index if needed
          if (existingChapter.index !== i + 1) {
            await prisma.chapters.update({
              where: { id: existingChapter.id },
              data: { index: i + 1 },
            })
          }
          continue
        }

        // Extract m3u8 URL from episode page
        let m3u8Url: string | null = null
        try {
          const epHtml = await fetchWithRetry(ep.url)
          const $ep = load(epHtml)

          $ep('script').each((_, script) => {
            const scriptContent = $ep(script).html() || ''
            
            const match1 = scriptContent.match(/videoSrc\s*=\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i)
            if (match1) { m3u8Url = match1[1]; return false }

            const match2 = scriptContent.match(/loadSource\s*\(\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i)
            if (match2) { m3u8Url = match2[1]; return false }

            const match3 = scriptContent.match(/url\s*:\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i)
            if (match3) { m3u8Url = match3[1]; return false }

            const match4 = scriptContent.match(/(https?:\/\/[^'"\s]+\.m3u8[^'"\s]*)/i)
            if (match4) { m3u8Url = match4[1]; return false }
          })
        } catch (err: any) {
          log('warn', `  Failed to fetch episode: ${ep.title} - ${err.message}`)
        }

        await prisma.chapters.create({
          data: {
            storyId: story.id,
            title: ep.title,
            slug: chapterSlug,
            index: i + 1,
            videoUrl: ep.url,
            sourceUrl: m3u8Url,
          },
        })

        await delay(300) // Small delay between episode crawls
      }

      log('success', `  ✓ Saved ${episodes.length} episodes`)
    }

    // ─── Log to crawl_logs ───
    await prisma.crawl_logs.create({
      data: {
        id: crypto.randomUUID(),
        url,
        type: 'story',
        status: 'SUCCESS',
        message: `Crawled: ${title} | ${genres.length} genres, ${actors.length} actors, ${episodes.length} episodes`,
      },
    })

    log('success', `✓ ${title} | G:${genreIds.length} A:${actorIds.length} T:${tagIds.length} E:${episodes.length}`)

  } catch (error: any) {
    log('error', `❌ Failed: ${url} - ${error.message}`)

    // Log failure
    try {
      await prisma.crawl_logs.create({
        data: {
          id: crypto.randomUUID(),
          url,
          type: 'story',
          status: 'FAILED',
          error: error.message,
        },
      })
    } catch {} // Ignore log errors
  }
}

// ═══════════════════════════════════════════════════════════════
// BATCH PROCESSING
// ═══════════════════════════════════════════════════════════════

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('\n')
  console.log('══════════════════════════════════════════════════════════')
  console.log('  🎬 ANIME47 CRAWLER')
  console.log('══════════════════════════════════════════════════════════')

  if (CONFIG.TEST_MODE) {
    console.log(`  🧪 TEST MODE: Limit ${CONFIG.TEST_LIMIT} anime`)
  }
  if (CONFIG.GENRES_ONLY) {
    console.log('  📁 GENRES ONLY mode')
  }
  if (CONFIG.STORIES_ONLY) {
    console.log('  📖 STORIES ONLY mode (skipping genres)')
  }

  console.log(`  Source: ${CONFIG.SITEMAP_INDEX_URL}`)
  console.log('══════════════════════════════════════════════════════════\n')

  // ═══ Step 1: Fetch sitemap index ═══
  log('info', 'Step 1: Fetching sitemap index...')
  const indexXml = await fetchWithRetry(CONFIG.SITEMAP_INDEX_URL)
  const sitemaps = await parseSitemapIndex(indexXml)
  log('success', `Found ${sitemaps.length} sitemaps in index`)

  // Classify sitemaps
  const genreSitemaps: string[] = []
  const storySitemaps: string[] = []

  for (const sitemap of sitemaps) {
    const type = detectSitemapType(sitemap.loc)
    if (type === 'genre') genreSitemaps.push(sitemap.loc)
    else if (type === 'story') storySitemaps.push(sitemap.loc)
    else log('info', `Skipping sitemap (${type}): ${sitemap.loc}`)
  }

  log('info', `Genre sitemaps: ${genreSitemaps.length}`)
  log('info', `Story sitemaps: ${storySitemaps.length}`)

  // ═══ Step 2: Crawl Genres ═══
  let sessionStats = {
    stories: 0,
    genres: 0,
    actors: 0,
    authors: 0,
    tags: 0,
    chapters: 0,
    failed: 0
  }

  if (!CONFIG.STORIES_ONLY) {
    log('info', '\nStep 2: Crawling genres...')

    for (const sitemapUrl of genreSitemaps) {
      log('info', `Fetching genre sitemap: ${sitemapUrl}`)
      const xml = await fetchWithRetry(sitemapUrl)
      let urls = await parseSitemap(xml)

      if (CONFIG.TEST_MODE) {
        urls = urls.slice(0, 5) // Chỉ test 5 danh mục cho nhanh
        log('info', `🧪 TEST MODE: Limit 5 genres from this sitemap`)
      }

      log('info', `Processing ${urls.length} genre URLs`)

      for (const urlObj of urls) {
        const slug = extractSlugFromUrl(urlObj.loc)
        
        if (!CONFIG.FORCE_UPDATE) {
          const exists = await prisma.genres.findUnique({ where: { slug } })
          if (exists) {
            log('info', `⏩ Skip existing genre: ${slug}`)
            continue
          }
        }

        await crawlGenre(urlObj.loc)
        sessionStats.genres++
        await delay(CONFIG.DELAY_BETWEEN_GENRES)
      }
    }

    log('success', '✅ Genres crawl complete')
  }

  // ... (giữ nguyên phần thu thập story URLs) ...
  // Thu thập story URLs
  const allStoryUrls: string[] = []
  for (const sitemapUrl of storySitemaps) {
    const xml = await fetchWithRetry(sitemapUrl)
    const urls = await parseSitemap(xml)
    allStoryUrls.push(...urls.map(u => u.loc))
  }

  // Apply test limit
  let urlsToProcess = allStoryUrls
  if (CONFIG.TEST_MODE) {
    urlsToProcess = allStoryUrls.slice(0, CONFIG.TEST_LIMIT)
  }

  // Process in batches
  const chunks = chunkArray(urlsToProcess, CONFIG.BATCH_SIZE)
  let processed = 0

  for (const chunk of chunks) {
    log('info', `\nBatch ${processed + 1}-${processed + chunk.length}/${urlsToProcess.length}`)
    for (const url of chunk) {
      try {
        if (!CONFIG.FORCE_UPDATE) {
          let urlPathname = url;
          try {
            const uObj = new URL(url);
            urlPathname = uObj.pathname;
            if (urlPathname.endsWith('/') && urlPathname.length > 1) {
              urlPathname = urlPathname.slice(0, -1);
            }
          } catch {}

          const exists = await prisma.stories.findFirst({ 
            where: urlPathname.length > 5 
              ? { sourceUrl: { contains: urlPathname } } 
              : { sourceUrl: url }
          })
          
          if (exists) {
            // Nếu đã có trong DB, kiểm tra xem đã có ảnh local chưa
            // Nếu coverImage là null hoặc bắt đầu bằng http (remote), chúng ta sẽ không skip để nó thử tải lại ảnh
            const hasLocalImage = exists.coverImage && (exists.coverImage.startsWith('/') || !exists.coverImage.startsWith('http'))
            
            if (hasLocalImage) {
              log('info', `⏩ Skip existing story: ${exists.title}`)
              sessionStats.stories++
              continue
            }
            log('info', `🔄 Retrying story with missing/remote image: ${exists.title}`)
          }
        }
        
        await crawlAnimeDetail(url)
        sessionStats.stories++
      } catch {
        sessionStats.failed++
      }
      await delay(CONFIG.DELAY_BETWEEN_REQUESTS)
    }
    processed += chunk.length
  }

  // ═══ Summary ═══
  const storyCount = await prisma.stories.count()
  const genreCount = await prisma.genres.count()
  const actorCount = await prisma.actors.count()
  const authorCount = await prisma.authors.count()
  const tagCount = await prisma.tags.count()
  const chapterCount = await prisma.chapters.count()

  console.log('\n')
  console.log('══════════════════════════════════════════════════════════')
  console.log('  📊 CRAWL SESSION SUMMARY (Lần chạy này)')
  console.log('══════════════════════════════════════════════════════════')
  console.log(`  Stories Crawled: ${sessionStats.stories}`)
  console.log(`  Genres Crawled:  ${sessionStats.genres}`)
  console.log(`  Failed:          ${sessionStats.failed}`)
  console.log('══════════════════════════════════════════════════════════')
  console.log('  📈 TOTAL DATABASE STATS (Tổng cộng trong máy)')
  console.log('══════════════════════════════════════════════════════════')
  console.log(`  Total Stories:   ${storyCount}`)
  console.log(`  Total Chapters:  ${chapterCount}`)
  console.log(`  Total Genres:    ${genreCount}`)
  console.log(`  Total Actors:    ${actorCount}`)
  console.log('══════════════════════════════════════════════════════════')
  console.log('  🎉 Crawl complete!')
  console.log('══════════════════════════════════════════════════════════\n')

  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error('Fatal error:', error)
  await prisma.$disconnect()
  process.exit(1)
})
