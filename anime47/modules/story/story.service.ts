import { httpService } from '@/services/http.service'
import { imageService } from '@/services/image.service'
import { load } from 'cheerio'
import { logger } from '@/lib/logger'
import { delay, chunkArray, slugify, cleanText, parseNumber, parseFloat as parseFloatHelper } from '@/lib/helpers'
import { config } from '@/lib/config'
import { prisma } from '@/lib/prisma'
import { storyRepository } from './story.repository'
import { storyMapper } from './story.mapper'
import { genreRepository } from '../genre/genre.repository'
import { actorRepository } from '../actor/actor.repository'
import { tagRepository } from '../tag/tag.repository'
import { IStoryRaw } from '@/types/story.types'

class StoryService {
  /**
   * Replace domain trong content
   */
  private replaceDomain(text: string | undefined): string {
    if (!text) return ''
    return text.replace(new RegExp(config.app.sourceDomain, 'gi'), config.app.domain)
  }

  /**
   * Crawl chi tiết 1 story
   */
  async crawlStoryDetail(url: string): Promise<void> {
    try {
      logger.info(`Crawling story: ${url}`)

      // Fetch HTML
      const html = await httpService.fetchHtml(url)
      const $ = load(html)

      // Parse raw data từ HTML
      const rawData: IStoryRaw = {
        // Basic Info
        title: $('h1.movie-title-detail').text().trim(),
        alternativeName: $('h2.movie-original-title').text().trim(),
        description: this.replaceDomain($('.content-detail .justify-text').text().trim()),
        coverImage: $('.movie-box-img img').attr('data-lazy-src') || 
                     $('.movie-box-img img').attr('data-src') || 
                     $('.movie-box-img img').attr('src'),
        thumbnail: $('.movie-thumbnail img, .thumbnail img, meta[property="og:image"]').attr('content') ||
                   $('.movie-box-img img').attr('data-lazy-src') || 
                   $('.movie-box-img img').attr('data-src') || 
                   $('.movie-box-img img').attr('src'),
        
        // Meta info từ table
        releaseYear: undefined,
        director: undefined,
        cast: undefined,
        genres: [],
        
        // Stats
        quality: undefined,
        language: undefined,
        rating: undefined, // Không lấy rating từ nguồn
        views: undefined,  // Không lấy views từ nguồn
      }

      // Parse table info - extract directors and actors with URLs
      const directorsData: Array<{ name: string; url: string }> = []
      const actorsData: Array<{ name: string; url: string }> = []
      const keywordsData: string[] = []

      $('.movie-info-table tr').each((_, row) => {
        const $row = $(row)
        const headerText = $row.find('th').text().trim()
        const $td = $row.find('td')

        if (headerText.includes('Năm phát hành')) {
          const yearText = $td.find('a').text().trim() || $td.text().trim()
          rawData.releaseYear = yearText
        }
        else if (headerText.includes('Đạo diễn')) {
          $td.find('a').each((_, el) => {
            const $el = $(el)
            directorsData.push({
              name: $el.text().trim(),
              url: $el.attr('href') || '',
            })
          })
          rawData.director = directorsData.map(d => d.name).join(', ')
        }
        else if (headerText.includes('Diễn viên')) {
          $td.find('a').each((_, el) => {
            const $el = $(el)
            actorsData.push({
              name: $el.text().trim(),
              url: $el.attr('href') || '',
            })
          })
          rawData.cast = actorsData.map(a => a.name).join(', ')
        }
        else if (headerText.includes('Thể loại')) {
          rawData.genres = $td.find('a').map((_, el) => $(el).text().trim()).get()
        }
        else if (headerText.includes('Từ khóa')) {
          const keywords = $td.find('a').map((_, el) => $(el).text().trim()).get()
          keywordsData.push(...keywords)
          rawData.keywords = keywords.join(', ')
        }
      })

      // Quality & Language
      $('.movie-info__stats .stat-item').each((_, el) => {
        const $el = $(el)
        const text = $el.find('span').text().trim()
        
        if ($el.find('.icon-play').length > 0 || $el.find('i[class*="play"]').length > 0) {
          rawData.quality = text
        } else if ($el.find('.icon-globe').length > 0 || $el.find('i[class*="globe"]').length > 0) {
          rawData.language = text
        }
      })

      // Download cover image về local
      let localCoverUrl = null
      if (rawData.coverImage) {
        localCoverUrl = await imageService.downloadImage(rawData.coverImage)
      }

      // Download thumbnail về local
      let localThumbnailUrl = null
      if (rawData.thumbnail && rawData.thumbnail !== rawData.coverImage) {
        localThumbnailUrl = await imageService.downloadImage(rawData.thumbnail)
      } else if (localCoverUrl) {
        // Nếu thumbnail trùng với cover hoặc không có, dùng cover
        localThumbnailUrl = localCoverUrl
      }

      // Normalize data
      const normalized = storyMapper.normalize(rawData, url)
      if (!normalized) {
        logger.warn(`Failed to normalize story data: ${url}`)
        return
      }

      // Override coverImage và thumbnail với local URLs
      if (localCoverUrl) {
        normalized.coverImage = localCoverUrl
      }
      if (localThumbnailUrl) {
        normalized.thumbnail = localThumbnailUrl
      }

      // Process genres (match với genres đã có trong DB hoặc tạo mới)
      const genreIds: string[] = []
      if (rawData.genres && rawData.genres.length > 0) {
        for (const genreName of rawData.genres) {
          if (!genreName || genreName.trim() === '') continue
          const gSlug = slugify(genreName)
          const genreId = await genreRepository.findOrCreate(genreName, gSlug)
          genreIds.push(genreId)
        }
      }

      // Process directors → authors table
      let authorId: string | undefined
      if (directorsData.length > 0) {
        const firstDir = directorsData[0]
        const dirSlug = slugify(firstDir.name)
        if (dirSlug) {
          const existingAuthor = await prisma.authors.findUnique({ where: { slug: dirSlug } })
          if (existingAuthor) {
            authorId = existingAuthor.id
          } else {
            const newAuthor = await prisma.authors.create({
              data: {
                name: firstDir.name,
                slug: dirSlug,
                sourceUrl: firstDir.url,
              }
            })
            authorId = newAuthor.id
          }
        }
      }

      // Process actors
      const actorIds: string[] = []
      for (const actorData of actorsData) {
        const actorSlug = slugify(actorData.name)
        if (!actorSlug) continue
        const actorId = await actorRepository.findOrCreate(actorData.name, actorSlug, actorData.url)
        actorIds.push(actorId)
      }

      // Process tags (keywords)
      const tagIds: string[] = []
      for (const keyword of keywordsData) {
        const tSlug = slugify(keyword)
        if (!tSlug) continue
        const tagId = await tagRepository.findOrCreate(keyword, tSlug)
        tagIds.push(tagId)
      }

      // Save to DB
      const story = await storyRepository.upsert({
        ...normalized,
        authorId,
        genreIds,
        actorIds,
        tagIds,
      })

      // Parse và lưu Episodes (Chapters)
      const episodes = $('.episodes-grid a.episode-item').map((_, el) => {
        const $el = $(el)
        const title = $el.find('.episode-number').text().trim()
        const episodeUrl = $el.attr('href')
        
        return {
          title: title || 'Unknown',
          url: episodeUrl || '',
        }
      }).get()

      if (episodes.length > 0) {
        logger.info(`Found ${episodes.length} episodes for: ${normalized.title}`)
        
        // Lưu chapters vào DB
        for (let i = 0; i < episodes.length; i++) {
          const ep = episodes[i]
          if (!ep.url) continue

          const chapterSlug = slugify(ep.title)
          
          // Fetch chapter page để lấy m3u8 URL
          logger.info(`Crawling chapter: ${ep.title}`)
          const { chapterService } = await import('../chapter/chapter.service')
          const m3u8Url = await chapterService.extractVideoUrl(ep.url)

          await prisma.chapters.upsert({
            where: {
              storyId_slug: {
                storyId: story.id,
                slug: chapterSlug,
              },
            },
            create: {
              storyId: story.id,
              title: ep.title,
              slug: chapterSlug,
              index: i + 1,
              videoUrl: this.replaceDomain(ep.url),
              sourceUrl: m3u8Url, // ← Lưu m3u8 URL
            },
            update: {
              title: ep.title,
              index: i + 1,
              videoUrl: this.replaceDomain(ep.url),
              sourceUrl: m3u8Url, // ← Update m3u8 URL
            },
          })
        }
        
        logger.success(`✓ Saved ${episodes.length} episodes`)
      } else {
        logger.warn(`No episodes found for: ${normalized.title}`)
      }

      logger.success(`✓ Crawled story: ${normalized.title}`)
    } catch (error) {
      logger.error(`Failed to crawl story: ${url}`, error)
    }
  }

  /**
   * Crawl nhiều stories với batch processing
   */
  async crawlStories(urls: string[]): Promise<void> {
    logger.info(`Starting to crawl ${urls.length} stories`)

    const chunks = chunkArray(urls, config.crawler.batchSize)
    let processed = 0

    for (const chunk of chunks) {
      logger.info(`Processing batch ${processed + 1}-${processed + chunk.length}/${urls.length}`)

      await Promise.all(
        chunk.map(async (url) => {
          await this.crawlStoryDetail(url)
          await delay(config.crawler.delayMs)
        })
      )

      processed += chunk.length
      logger.info(`Progress: ${processed}/${urls.length} (${Math.round((processed / urls.length) * 100)}%)`)
    }

    logger.success(`Completed crawling ${urls.length} stories`)
  }

  /**
   * Lấy story theo slug
   */
  async getStoryBySlug(slug: string) {
    return storyRepository.findBySlug(slug)
  }

  /**
   * Lấy story theo ID
   */
  async getStoryById(id: string) {
    return prisma.stories.findUnique({
      where: { id },
      include: {
        authors: true,
        story_genres: {
          include: {
            genres: true,
          },
        },
        story_actors: {
          include: {
            actors: true,
          },
        },
      },
    })
  }

  /**
   * Lấy danh sách stories mới nhất
   */
  async getLatestStories(limit: number = 20) {
    return prisma.stories.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        authors: true,
        story_genres: {
          include: {
            genres: true,
          },
        },
      },
    })
  }

  /**
   * Lấy danh sách stories hot (theo views hoặc rating)
   */
  async getHotStories(limit: number = 10) {
    return prisma.stories.findMany({
      take: limit,
      orderBy: [
        { views: 'desc' },
        { rating: 'desc' },
      ],
      include: {
        authors: true,
        story_genres: {
          include: {
            genres: true,
          },
        },
      },
    })
  }
  /**
   * Lấy danh sách stories sắp chiếu
   */
  async getUpcomingStories(limit: number = 8) {
    return prisma.stories.findMany({
      where: {
        OR: [
          { status: { contains: 'upcoming', mode: 'insensitive' } },
          { status: { contains: 'sắp chiếu', mode: 'insensitive' } },
          { status: { contains: 'trailer', mode: 'insensitive' } },
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        authors: true,
        story_genres: {
          include: {
            genres: true,
          },
        },
      },
    })
  }

  /**
   * Lấy danh sách stories liên quan (cùng thể loại)
   */
  async getRelatedStories(storyId: string, limit: number = 6) {
    // Lấy genres của story hiện tại
    const storyGenres = await prisma.story_genres.findMany({
      where: { storyId },
      select: { genreId: true },
    })

    if (storyGenres.length === 0) {
      // Nếu không có genres, trả về stories mới nhất (loại trừ story hiện tại)
      return prisma.stories.findMany({
        where: { id: { not: storyId } },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
    }

    const genreIds = storyGenres.map(sg => sg.genreId)

    // Tìm stories có cùng genres
    return prisma.stories.findMany({
      where: {
        id: { not: storyId },
        story_genres: {
          some: {
            genreId: { in: genreIds },
          },
        },
      },
      take: limit,
      orderBy: [
        { rating: 'desc' },
        { views: 'desc' },
      ],
    })
  }

  /**
   * Lấy top stories theo rating (cho ranking board)
   */
  async getTopRatedStories(limit: number = 10, period?: 'day' | 'month' | 'year') {
    let dateFilter: Date | undefined

    if (period === 'day') {
      dateFilter = new Date()
      dateFilter.setHours(0, 0, 0, 0)
    } else if (period === 'month') {
      dateFilter = new Date()
      dateFilter.setDate(1)
      dateFilter.setHours(0, 0, 0, 0)
    } else if (period === 'year') {
      dateFilter = new Date()
      dateFilter.setMonth(0, 1)
      dateFilter.setHours(0, 0, 0, 0)
    }

    return prisma.stories.findMany({
      where: dateFilter ? {
        updatedAt: { gte: dateFilter },
        rating: { not: null },
      } : {
        rating: { not: null },
      },
      take: limit,
      orderBy: [
        { rating: 'desc' },
        { views: 'desc' },
      ],
    })
  }
}

export const storyService = new StoryService()
