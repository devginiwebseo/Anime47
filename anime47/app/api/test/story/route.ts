import { NextResponse } from 'next/server'
import { httpService } from '@/services/http.service'
import { load } from 'cheerio'
import { logger } from '@/lib/logger'

/**
 * POST /api/test/story
 * Test crawl 1 truyện để kiểm tra selectors
 */
export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    logger.info(`Testing story crawl: ${url}`)

    let html: string
    try {
      // Fetch HTML
      html = await httpService.fetchHtml(url)
      logger.info(`✓ HTML fetched, length: ${html.length}`)
    } catch (error: any) {
      logger.error(`Failed to fetch HTML`, error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch HTML',
        details: error.message
      }, { status: 500 })
    }

    let $: any
    try {
      $ = load(html)
      logger.info(`✓ HTML parsed with Cheerio`)
    } catch (error: any) {
      logger.error(`Failed to parse HTML`, error)
      return NextResponse.json({
        success: false,
        error: 'Failed to parse HTML',
        details: error.message
      }, { status: 500 })
    }

    // Parse data theo cấu trúc thực tế của anime47.onl
    const rawData: any = {
      url,
      
      // Basic Info
      title: $('h1.movie-title-detail').text().trim(),
      alternativeName: $('h2.movie-original-title').text().trim(),
      coverImage: $('.movie-box-img img').attr('data-lazy-src') || $('.movie-box-img img').attr('data-src') || $('.movie-box-img img').attr('src'),
      description: $('.content-detail .justify-text').text().trim(),

      // Meta từ table
      releaseYear: null,
      director: [],
      cast: [],
      genres: [],
      keywords: [],
      
      // Stats
      quality: null,
      language: null,
      rating: null,
      views: null,
      
      // Episodes
      episodes: [],
    }

    // Parse table info
    $('.movie-info-table tr').each((_: number, row: any) => {
      const $row = $(row)
      const headerText = $row.find('th').text().trim()
      const $td = $row.find('td')

      if (headerText.includes('Năm phát hành')) {
        rawData.releaseYear = $td.find('a').text().trim() || $td.text().trim()
      }
      else if (headerText.includes('Đạo diễn')) {
        rawData.director = $td.find('a').map((_: number, el: any) => $(el).text().trim()).get()
      }
      else if (headerText.includes('Diễn viên')) {
        rawData.cast = $td.find('a').map((_: number, el: any) => $(el).text().trim()).get()
      }
      else if (headerText.includes('Thể loại')) {
        rawData.genres = $td.find('a').map((_: number, el: any) => ({
          name: $(el).text().trim(),
          url: $(el).attr('href')
        })).get()
      }
      else if (headerText.includes('Từ khóa')) {
        rawData.keywords = $td.find('a').map((_: number, el: any) => $(el).text().trim()).get()
      }
    })

    // Quality & Language từ stats
    $('.movie-info__stats .stat-item').each((_: number, el: any) => {
      const $el = $(el)
      const text = $el.find('span').text().trim()
      
      if ($el.find('.icon-play').length > 0) {
        rawData.quality = text
      } else if ($el.find('.icon-globe').length > 0) {
        rawData.language = text
      }
    })

    // Rating
    const ratingText = $('.rating-avg').text().trim()
    if (ratingText) {
      rawData.rating = parseFloat(ratingText)
    }

    // Views
    const viewsText = $('.post-view-count').text().trim()
    if (viewsText) {
      // Remove commas: "1,348" -> "1348"
      rawData.views = parseInt(viewsText.replace(/,/g, ''))
    }

    // Episodes
    rawData.episodes = $('.episodes-grid a.episode-item').map((_: number, el: any) => ({
      title: $(el).find('.episode-number').text().trim(),
      url: $(el).attr('href')
    })).get()

    logger.success(`Successfully crawled story data`)

    return NextResponse.json({
      success: true,
      data: rawData,
      summary: {
        title: rawData.title,
        hasAlternativeName: !!rawData.alternativeName,
        hasCover: !!rawData.coverImage,
        releaseYear: rawData.releaseYear,
        directorCount: rawData.director.length,
        castCount: rawData.cast.length,
        genreCount: rawData.genres.length,
        quality: rawData.quality,
        language: rawData.language,
        rating: rawData.rating,
        views: rawData.views,
        episodeCount: rawData.episodes.length,
      }
    })
  } catch (error: any) {
    logger.error('Test story crawl failed', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
