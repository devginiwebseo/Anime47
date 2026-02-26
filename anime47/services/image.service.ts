import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { logger } from '@/lib/logger'
import crypto from 'crypto'

class ImageService {
  private baseUploadDir = path.join(process.cwd(), 'public', 'upload', 'image')

  constructor() {
    // Tạo thư mục gốc nếu chưa tồn tại
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true })
    }
  }

  /**
   * Lấy thư mục upload theo tháng hiện tại (e.g., 02/2026)
   */
  private getMonthlyDir(): string {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = String(now.getFullYear())
    const monthlyDir = path.join(this.baseUploadDir, month, year)

    if (!fs.existsSync(monthlyDir)) {
      fs.mkdirSync(monthlyDir, { recursive: true })
    }

    return monthlyDir
  }

  /**
   * Lấy relative URL path theo tháng hiện tại
   */
  private getMonthlyUrlPath(): string {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = String(now.getFullYear())
    return `/upload/image/${month}/${year}`
  }

  /**
   * Download ảnh từ URL và lưu vào local (phân theo tháng)
   * @returns Local URL path (e.g., /upload/image/02/2026/abc123.webp)
   */
  async downloadImage(imageUrl: string): Promise<string | null> {
    try {
      if (!imageUrl || imageUrl.includes('data:image') || imageUrl.includes('svg+xml')) {
        logger.warn(`Skipping invalid/placeholder image: ${imageUrl}`)
        return null
      }

      // Kiểm tra xem ảnh đã tải trước đó chưa (tìm ở tất cả thư mục)
      const hash = crypto.createHash('md5').update(imageUrl).digest('hex')
      const ext = this.getExtension(imageUrl)
      const filename = `${hash}${ext}`

      // Kiểm tra ở thư mục gốc cũ (backward compatibility)
      const oldFilepath = path.join(this.baseUploadDir, filename)
      if (fs.existsSync(oldFilepath)) {
        const localUrl = `/upload/image/${filename}`
        logger.info(`Image already exists (legacy): ${localUrl}`)
        return localUrl
      }

      // Kiểm tra ở thư mục tháng hiện tại
      const monthlyDir = this.getMonthlyDir()
      const monthlyFilepath = path.join(monthlyDir, filename)
      if (fs.existsSync(monthlyFilepath)) {
        const localUrl = `${this.getMonthlyUrlPath()}/${filename}`
        logger.info(`Image already exists: ${localUrl}`)
        return localUrl
      }

      logger.info(`Downloading image: ${imageUrl}`)

      // Download image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://anime47.onl/',
        },
      })

      // Lưu vào thư mục theo tháng
      fs.writeFileSync(monthlyFilepath, response.data)

      const localUrl = `${this.getMonthlyUrlPath()}/${filename}`
      logger.success(`Image saved: ${localUrl}`)

      return localUrl
    } catch (error: any) {
      logger.error(`Failed to download image: ${imageUrl}`, error)
      return null // Trả về null để dùng URL gốc
    }
  }

  /**
   * Lấy extension từ URL
   */
  private getExtension(imageUrl: string): string {
    try {
      const urlPath = new URL(imageUrl).pathname
      const ext = path.extname(urlPath)
      return ext || '.webp'
    } catch {
      return '.webp'
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
