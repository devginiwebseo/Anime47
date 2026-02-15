import * as cheerio from 'cheerio'
import { CheerioAPI } from 'cheerio'
import { logger } from '@/lib/logger'

class HtmlParserService {
  /**
   * Parse HTML string to Cheerio instance
   */
  parse(html: string): CheerioAPI {
    try {
      return cheerio.load(html)
    } catch (error) {
      logger.error('Failed to parse HTML', error)
      throw error
    }
  }

  /**
   * Extract text từ selector
   */
  getText($: CheerioAPI, selector: string): string {
    return $(selector).text().trim()
  }

  /**
   * Extract attribute từ selector
   */
  getAttr($: CheerioAPI, selector: string, attr: string): string | undefined {
    return $(selector).attr(attr)?.trim()
  }

  /**
   * Extract src từ img tag
   */
  getImageSrc($: CheerioAPI, selector: string): string | undefined {
    return this.getAttr($, selector, 'src')
  }

  /**
   * Extract href từ a tag
   */
  getHref($: CheerioAPI, selector: string): string | undefined {
    return this.getAttr($, selector, 'href')
  }

  /**
   * Check if element exists
   */
  exists($: CheerioAPI, selector: string): boolean {
    return $(selector).length > 0
  }
}

export const htmlParserService = new HtmlParserService()
