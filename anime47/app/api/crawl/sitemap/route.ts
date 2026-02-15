import { NextResponse } from 'next/server'
import { sitemapService } from '@/modules/sitemap/sitemap.service'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    logger.info(`API: Crawling sitemap index from ${url}`)

    const sitemaps = await sitemapService.crawlSitemapIndex(url)

    return NextResponse.json({
      success: true,
      data: {
        count: sitemaps.length,
        sitemaps,
      },
    })
  } catch (error: any) {
    logger.error('API Error: Failed to crawl sitemap index', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to crawl sitemap index' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with { "url": "sitemap_url" }',
  })
}
