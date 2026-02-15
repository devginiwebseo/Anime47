import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { logger } from '@/lib/logger'
import crypto from 'crypto'

class ImageService {
  private uploadDir = path.join(process.cwd(), 'public', 'upload', 'image')

  constructor() {
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  /**
   * Download ảnh từ URL và lưu vào local
   * @returns Local URL path (e.g., /upload/image/abc123.webp)
   */
  async downloadImage(imageUrl: string): Promise<string | null> {
    try {
      if (!imageUrl || imageUrl.includes('data:image') || imageUrl.includes('svg+xml')) {
        logger.warn(`Skipping invalid/placeholder image: ${imageUrl}`)
        return null
      }

      logger.info(`Downloading image: ${imageUrl}`)

      // Download image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      // Generate filename từ hash
      const hash = crypto.createHash('md5').update(imageUrl).digest('hex')
      const ext = path.extname(new URL(imageUrl).pathname) || '.webp'
      const filename = `${hash}${ext}`
      const filepath = path.join(this.uploadDir, filename)

      // Save to disk
      fs.writeFileSync(filepath, response.data)

      const localUrl = `/upload/image/${filename}`
      logger.success(`Image saved: ${localUrl}`)

      return localUrl
    } catch (error: any) {
      logger.error(`Failed to download image: ${imageUrl}`, error)
      return null // Trả về null để dùng URL gốc
    }
  }

  /**
   * Download thumbnail nếu khác với cover
   */
  async downloadThumbnail(thumbnailUrl: string | undefined, coverUrl: string | undefined): Promise<string | null> {
    if (!thumbnailUrl || thumbnailUrl === coverUrl) {
      return null // Không cần download nếu giống cover
    }
    return this.downloadImage(thumbnailUrl)
  }
}

export const imageService = new ImageService()
