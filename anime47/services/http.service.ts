import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { logger } from '@/lib/logger'
import { config } from '@/lib/config'
import { delay } from '@/lib/helpers'

class HttpService {
  private client: AxiosInstance
  
  constructor() {
    this.client = axios.create({
      timeout: config.crawler.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
  }

  /**
   * Fetch với retry logic
   */
  async fetchWithRetry(
    url: string, 
    options?: AxiosRequestConfig,
    retries = config.crawler.maxRetries
  ): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        logger.info(`Fetching: ${url} (attempt ${i + 1}/${retries})`)
        
        const response = await this.client.get(url, options)
        
        if (response.status === 200) {
          logger.success(`Fetched successfully: ${url}`)
          return response.data
        }
        
        throw new Error(`HTTP ${response.status}`)
      } catch (error: any) {
        logger.warn(`Fetch failed (${i + 1}/${retries}): ${url}`, {
          error: error.message,
        })
        
        if (i < retries - 1) {
          const delayTime = config.crawler.delayMs * (i + 1)
          logger.info(`Retrying after ${delayTime}ms...`)
          await delay(delayTime)
        } else {
          logger.error(`All retries failed for: ${url}`, error)
          throw error
        }
      }
    }
    
    throw new Error('Should not reach here')
  }

  /**
   * Fetch XML sitemap
   */
  async fetchXml(url: string): Promise<string> {
    return this.fetchWithRetry(url, {
      headers: {
        'Accept': 'application/xml, text/xml',
      },
    })
  }

  /**
   * Fetch HTML page
   */
  async fetchHtml(url: string): Promise<string> {
    return this.fetchWithRetry(url, {
      headers: {
        'Accept': 'text/html',
      },
    })
  }
}

export const httpService = new HttpService()
