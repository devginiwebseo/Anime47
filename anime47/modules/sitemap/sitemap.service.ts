import { httpService } from '@/services/http.service'
import { sitemapParser } from './sitemap.parser'
import { logger } from '@/lib/logger'
import { ISitemapIndex, IParsedSitemap, SitemapType } from '@/types/sitemap.types'

class SitemapService {
  /**
   * Crawl sitemap index
   */
  async crawlSitemapIndex(url: string): Promise<ISitemapIndex[]> {
    try {
      logger.info(`Crawling sitemap index: ${url}`)
      
      const xml = await httpService.fetchXml(url)
      const sitemaps = await sitemapParser.parseSitemapIndex(xml)
      
      logger.success(`Found ${sitemaps.length} sitemaps in index`)
      
      return sitemaps
    } catch (error) {
      logger.error(`Failed to crawl sitemap index: ${url}`, error)
      throw error
    }
  }

  /**
   * Crawl một sitemap và phân loại
   */
  async crawlSitemap(url: string): Promise<IParsedSitemap> {
    try {
      logger.info(`Crawling sitemap: ${url}`)
      
      const xml = await httpService.fetchXml(url)
      const parsed = await sitemapParser.parseAndClassify(xml, url) // Pass URL here
      
      logger.success(`Crawled sitemap with ${parsed.urls.length} URLs (type: ${parsed.type})`)
      
      return parsed
    } catch (error) {
      logger.error(`Failed to crawl sitemap: ${url}`, error)
      throw error
    }
  }

  /**
   * Crawl tất cả sitemaps từ index và group theo type
   */
  async crawlAllSitemaps(inputUrl: string): Promise<Map<SitemapType, string[]>> {
    const urlsByType = new Map<SitemapType, string[]>()

    try {
      // 1. Fetch XML
      const xml = await httpService.fetchXml(inputUrl)
      
      // 2. Check detected type (Index vs Single)
      const isIndex = xml.includes('<sitemapindex')
      
      if (isIndex) {
        logger.info('Detected Sitemap Index')
        // Process as Sitemap Index
        const sitemaps = await sitemapParser.parseSitemapIndex(xml)
        
        for (const sitemap of sitemaps) {
          try {
            const parsed = await this.crawlSitemap(sitemap.loc)
            const existing = urlsByType.get(parsed.type) || []
            urlsByType.set(parsed.type, [...existing, ...parsed.urls.map(u => u.loc)])
          } catch (error) {
            logger.error(`Failed to process sitemap form index: ${sitemap.loc}`)
          }
        }
      } else {
        logger.info('Detected Single Sitemap')
        // Process as Single Sitemap (like post-sitemap1.xml or category-sitemap.xml)
        const parsed = await sitemapParser.parseAndClassify(xml, inputUrl) // Pass inputUrl here
        urlsByType.set(parsed.type, parsed.urls.map(u => u.loc))
      }

    } catch (error) {
       logger.error(`Failed to crawl sitemaps: ${inputUrl}`, error)
       throw error
    }

    // Log summary
    logger.info('Sitemap crawl summary:')
    urlsByType.forEach((urls, type) => {
      logger.info(`  ${type}: ${urls.length} URLs`)
    })

    return urlsByType
  }
}

export const sitemapService = new SitemapService()
