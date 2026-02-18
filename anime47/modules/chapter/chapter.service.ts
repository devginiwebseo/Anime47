import { httpService } from '@/services/http.service'
import { load } from 'cheerio'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

class ChapterService {
  /**
   * Extract m3u8 URL từ chapter page bằng static HTML parsing
   */
  async extractVideoUrl(chapterUrl: string): Promise<string | null> {
    try {
      logger.info(`Extracting video from: ${chapterUrl}`)

      const html = await httpService.fetchHtml(chapterUrl)
      const $ = load(html)

      // Tìm trong script tags
      let m3u8Url: string | null = null

      $('script').each((_, script) => {
        const scriptContent = $(script).html() || ''
        
        // Pattern 1: videoSrc = 'https://...index.m3u8'
        const match1 = scriptContent.match(/videoSrc\s*=\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i)
        if (match1) {
          m3u8Url = match1[1]
          return false // break
        }

        // Pattern 2: loadSource('https://...index.m3u8')
        const match2 = scriptContent.match(/loadSource\s*\(\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i)
        if (match2) {
          m3u8Url = match2[1]
          return false
        }

        // Pattern 3: url: 'https://...index.m3u8'
        const match3 = scriptContent.match(/url\s*:\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i)
        if (match3) {
          m3u8Url = match3[1]
          return false
        }

        // Pattern 4: Bất kỳ .m3u8 URL nào
        const match4 = scriptContent.match(/(https?:\/\/[^'"\s]+\.m3u8[^'"\s]*)/i)
        if (match4) {
          m3u8Url = match4[1]
          return false
        }
      })

      if (m3u8Url) {
        logger.success(`Found m3u8: ${m3u8Url}`)
        return m3u8Url
      } else {
        logger.warn(`No m3u8 found for: ${chapterUrl}`)
        return null
      }
    } catch (error: any) {
      logger.error(`Failed to extract video URL: ${chapterUrl}`, error)
      return null
    }
  }

  /**
   * Lấy tất cả chapters của một story
   */
  async getChaptersByStoryId(storyId: string) {
    return prisma.chapters.findMany({
      where: { storyId },
      orderBy: { index: 'asc' },
    })
  }

  /**
   * Lấy chapter theo storyId và index
   */
  async getChapterByIndex(storyId: string, index: number) {
    return prisma.chapters.findUnique({
      where: {
        storyId_index: {
          storyId,
          index,
        },
      },
    })
  }

  /**
   * Đếm số chapters của một story
   */
  async countChapters(storyId: string): Promise<number> {
    return prisma.chapters.count({
      where: { storyId },
    })
  }

  /**
   * Lấy chapter mới nhất của story
   */
  async getLatestChapter(storyId: string) {
    return prisma.chapters.findFirst({
      where: { storyId },
      orderBy: { index: 'desc' },
    })
  }
}

export const chapterService = new ChapterService()
