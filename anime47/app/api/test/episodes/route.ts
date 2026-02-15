import { NextResponse } from 'next/server'
import { httpService } from '@/services/http.service'
import { load } from 'cheerio'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 })
    }

    logger.info(`Testing episode parsing for: ${url}`)

    const html = await httpService.fetchHtml(url)
    const $ = load(html)

    // Test nhiều selectors
    const selectors = [
      '.episodes-grid a.episode-item',
      '.episodes-grid a',
      'a.episode-item',
      '.episode-item',
    ]

    const results: any = {}

    for (const selector of selectors) {
      const episodes = $(selector).map((i, el) => {
        const $el = $(el)
        return {
          html: $el.html()?.substring(0, 200),
          text: $el.text().trim(),
          href: $el.attr('href'),
          episodeNumber: $el.find('.episode-number').text().trim(),
        }
      }).get()

      results[selector] = {
        count: episodes.length,
        episodes: episodes.slice(0, 5), // Chỉ lấy 5 đầu
      }
    }

    return NextResponse.json({
      success: true,
      url,
      results,
    })
  } catch (error: any) {
    logger.error('Test episode parsing error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
