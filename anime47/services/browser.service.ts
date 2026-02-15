import { chromium, Browser, Page } from 'playwright'
import { logger } from '@/lib/logger'

class BrowserService {
  private browser: Browser | null = null

  /**
   * Get or create browser instance
   */
  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      logger.info('Launching browser...')
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }
    return this.browser
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      logger.info('Browser closed')
    }
  }

  /**
   * Execute script trên page và lấy m3u8 URL
   */
  async extractM3u8Url(url: string): Promise<string | null> {
    const browser = await this.getBrowser()
    const page = await browser.newPage()

    try {
      logger.info(`Loading page with browser: ${url}`)

      // Navigate đến page
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      // Wait cho video player load
      await page.waitForTimeout(3000)

      // Method 1: Intercept network requests cho .m3u8
      let m3u8Url: string | null = null

      // Method 2: Evaluate script để tìm videoSrc
      m3u8Url = await page.evaluate(() => {
        // Tìm trong window object
        if ((window as any).videoSrc) {
          return (window as any).videoSrc
        }

        // Tìm trong tất cả script tags
        const scripts = Array.from(document.querySelectorAll('script'))
        for (const script of scripts) {
          const content = script.textContent || script.innerHTML
          
          // Match videoSrc = 'https://...m3u8'
          const match = content.match(/videoSrc\s*=\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i)
          if (match) return match[1]

          // Match loadSource('https://...m3u8')
          const match2 = content.match(/loadSource\s*\(\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i)
          if (match2) return match2[1]

          // Match bất kỳ .m3u8 URL
          const match3 = content.match(/(https?:\/\/[^'"\s]+\.m3u8[^'"\s]*)/i)
          if (match3) return match3[1]
        }

        return null
      })

      if (m3u8Url) {
        logger.success(`Extracted m3u8 via browser: ${m3u8Url}`)
      } else {
        logger.warn(`No m3u8 found via browser: ${url}`)
      }

      await page.close()
      return m3u8Url

    } catch (error: any) {
      logger.error(`Browser extraction failed: ${url}`, error)
      await page.close()
      return null
    }
  }
}

export const browserService = new BrowserService()

// Cleanup on process exit
process.on('SIGINT', async () => {
  await browserService.close()
  process.exit()
})
