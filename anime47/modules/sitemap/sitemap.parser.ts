import { parseString } from 'xml2js'
import { logger } from '@/lib/logger'
import { ISitemapUrl, ISitemapIndex, IParsedSitemap, SitemapType } from '@/types/sitemap.types'

class SitemapParser {
  /**
   * Parse XML string to object
   */
  private async parseXml(xml: string): Promise<any> {
    return new Promise((resolve, reject) => {
      parseString(xml, { explicitArray: false }, (err: Error | null, result: any) => {
        if (err) {
          logger.error('Failed to parse XML', err)
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  /**
   * Parse sitemap index (chứa danh sách sitemap con)
   */
  async parseSitemapIndex(xml: string): Promise<ISitemapIndex[]> {
    const parsed = await this.parseXml(xml)
    
    if (!parsed.sitemapindex?.sitemap) {
      logger.warn('No sitemap found in sitemap index')
      return []
    }

    const sitemaps = Array.isArray(parsed.sitemapindex.sitemap)
      ? parsed.sitemapindex.sitemap
      : [parsed.sitemapindex.sitemap]

    return sitemaps.map((sitemap: any) => ({
      loc: sitemap.loc,
      lastmod: sitemap.lastmod,
    }))
  }

  /**
   * Parse sitemap (chứa danh sách URL)
   */
  async parseSitemap(xml: string): Promise<ISitemapUrl[]> {
    const parsed = await this.parseXml(xml)
    
    if (!parsed.urlset?.url) {
      logger.warn('No URLs found in sitemap')
      return []
    }

    const urls = Array.isArray(parsed.urlset.url)
      ? parsed.urlset.url
      : [parsed.urlset.url]

    return urls.map((url: any) => ({
      loc: url.loc,
      lastmod: url.lastmod,
      changefreq: url.changefreq,
      priority: url.priority,
    }))
  }

  /**
   * Detect sitemap type từ URL pattern
   */
  detectSitemapType(url: string): SitemapType {
    const urlLower = url.toLowerCase()
    
    // Check specific types first
    if (urlLower.includes('/chuong/') || urlLower.includes('/chapter/')) {
      return SitemapType.CHAPTER
    }
    if (urlLower.includes('/tac-gia/') || urlLower.includes('/author/')) {
      return SitemapType.AUTHOR
    }
    if (urlLower.includes('/the-loai/') || urlLower.includes('/genre/') || urlLower.includes('/category/') || urlLower.includes('/danh-muc/')) {
      return SitemapType.GENRE
    }
    
    // If not any of above, assume it's a STORY (usually root URLs or /truyen/ paths)
    // Example: https://anime47.tv/ikoku-nikki/ -> STORY
    return SitemapType.STORY
  }

  async parseAndClassify(xml: string, sitemapUrl?: string): Promise<IParsedSitemap> {
    const urls = await this.parseSitemap(xml)
    
    if (urls.length === 0) {
      return {
        type: SitemapType.UNKNOWN,
        urls: [],
      }
    }

    // Detect type từ sitemap filename FIRST (nếu có)
    let type = SitemapType.UNKNOWN
    
    if (sitemapUrl) {
      const urlLower = sitemapUrl.toLowerCase()
      if (urlLower.includes('category-sitemap') || urlLower.includes('genre-sitemap')) {
        type = SitemapType.GENRE
        logger.info(`Detected GENRE sitemap from filename: ${sitemapUrl}`)
      } else if (urlLower.includes('post-sitemap') || urlLower.includes('story-sitemap')) {
        type = SitemapType.STORY
        logger.info(`Detected STORY sitemap from filename: ${sitemapUrl}`)
      } else if (urlLower.includes('author-sitemap')) {
        type = SitemapType.AUTHOR
        logger.info(`Detected AUTHOR sitemap from filename: ${sitemapUrl}`)
      } else if (urlLower.includes('chapter-sitemap')) {
        type = SitemapType.CHAPTER
        logger.info(`Detected CHAPTER sitemap from filename: ${sitemapUrl}`)
      }
    }
    
    // Nếu chưa detect được từ filename, detect từ URL content
    if (type === SitemapType.UNKNOWN) {
      type = this.detectSitemapType(urls[0].loc)
    }
    
    logger.info(`Final sitemap type: ${type}`, { urlCount: urls.length })
    
    return {
      type,
      urls,
    }
  }
}

export const sitemapParser = new SitemapParser()
