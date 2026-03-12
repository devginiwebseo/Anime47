import { NextResponse } from 'next/server'
import { sitemapService } from '@/modules/sitemap/sitemap.service'
import { storyService } from '@/modules/story/story.service'
import { genreService } from '@/modules/genre/genre.service'
import { SitemapType } from '@/types/sitemap.types'
import { logger } from '@/lib/logger'
import { config } from '@/lib/config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { indexUrl } = body

    const url = indexUrl || config.sitemap.indexUrl

    // Auto-detect: Sitemap XML hoặc Story URL?
    const isSitemap = url.includes('.xml') || url.includes('sitemap')
    
    if (!isSitemap) {
      // Đây là URL truyện trực tiếp
      logger.info(`🎬 Detected STORY URL (not sitemap): ${url}`)
      logger.info(`Starting direct story crawl...`)
      
      await storyService.crawlStoryDetail(url)
      
      return NextResponse.json({
        success: true,
        message: '✓ Story crawled successfully',
        type: 'single_story',
        url,
      })
    }

    // Nếu là sitemap, xử lý bình thường
    logger.info(`API: Starting full crawl from ${url}`)

    // Step 1: Crawl all sitemaps and group by type
    const urlsByType = await sitemapService.crawlAllSitemaps(url)

    // Step 2: Process Genres if found
    const genreUrls = urlsByType.get(SitemapType.GENRE) || []
    if (genreUrls.length > 0) {
      logger.info(`Found ${genreUrls.length} genre URLs, processing...`)
      await genreService.processGenreUrls(genreUrls)
      logger.success(`PROCESSED GENRES`)
    }

    // Step 3: Crawl stories
    const storyUrls = urlsByType.get(SitemapType.STORY) || []
    
    if (storyUrls.length > 0) {
      logger.info(`Starting to crawl ${storyUrls.length} stories`)
      await storyService.crawlStories(storyUrls)
    }

    // Authors, actors, tags, and chapters are now crawled automatically
    // per story in storyService.crawlStoryDetail()

    return NextResponse.json({
      success: true,
      data: {
        sitemap: {
          total: Array.from(urlsByType.values()).reduce((sum, urls) => sum + urls.length, 0),
          byType: Object.fromEntries(
            Array.from(urlsByType.entries()).map(([type, urls]) => [type, urls.length])
          ),
        },
        crawled: {
          stories: storyUrls.length,
          // chapters: 0, // TODO
          // authors: 0,  // TODO
          // genres: 0,   // TODO
        },
      },
    })
  } catch (error: any) {
    logger.error('API Error: Failed to crawl all', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to crawl' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to start crawling all data',
    optional: {
      indexUrl: 'Custom sitemap index URL (default: anime47.tv/sitemap_index.xml)',
    },
  })
}
