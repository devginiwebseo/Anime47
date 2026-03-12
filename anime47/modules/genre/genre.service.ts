import { httpService } from '@/services/http.service'
import { load } from 'cheerio'
import { logger } from '@/lib/logger'
import { genreRepository } from './genre.repository'
import { prisma } from '@/lib/prisma'

class GenreService {
  /**
   * Extract slug from URL
   * Example: https://anime47.tv/hanh-dong/ → hanh-dong
   */
  private extractSlugFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname.replace(/^\/|\/$/g, '') // Remove leading/trailing slashes
      return pathname
    } catch {
      return ''
    }
  }

  /**
   * Crawl 1 genre page để lấy tên chính xác
   */
  async crawlGenreDetail(url: string): Promise<void> {
    try {
      logger.info(`Crawling genre: ${url}`)

      // Extract slug từ URL
      const slug = this.extractSlugFromUrl(url)
      if (!slug) {
        logger.warn(`Invalid genre URL: ${url}`)
        return
      }

      // Fetch HTML
      const html = await httpService.fetchHtml(url)
      const $ = load(html)

      // Parse <h1> để lấy tên thể loại
      const name = $('h1').first().text().trim()
      
      if (!name) {
        logger.warn(`No H1 found for genre: ${url}`)
        return
      }

      // Lưu vào DB
      await genreRepository.upsert({
        name,
        slug,
        sourceUrl: url,
      })

      logger.success(`✓ Crawled genre: ${name} (${slug})`)
    } catch (error) {
      logger.error(`Failed to crawl genre: ${url}`, error)
    }
  }

  /**
   * Process nhiều genre URLs
   */
  async processGenreUrls(urls: string[]): Promise<void> {
    logger.info(`Processing ${urls.length} genre URLs`)

    for (const url of urls) {
      await this.crawlGenreDetail(url)
      await new Promise(resolve => setTimeout(resolve, 500)) // Delay 500ms
    }

    logger.success(`Completed processing ${urls.length} genres`)
  }

  /**
   * Lấy danh sách genres của một story
   */
  async getGenresByStoryId(storyId: string) {
    const storyGenres = await prisma.story_genres.findMany({
      where: { storyId },
      include: {
        genres: true,
      },
    });

    return storyGenres.map(sg => sg.genres);
  }

  /**
   * Lấy tất cả genres
   */
  async getAllGenres() {
    return prisma.genres.findMany({
      orderBy: { name: 'asc' },
    });
  }
}

export const genreService = new GenreService()
