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
      try {
        fs.mkdirSync(monthlyDir, { recursive: true })
      } catch (err: any) {
        logger.error(`Could not create directory ${monthlyDir}: ${err.message}`)
      }
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

      const hash = crypto.createHash('md5').update(imageUrl).digest('hex')
      const ext = this.getExtension(imageUrl)
      const hashFilename = `${hash}${ext}`

      // Kiểm tra ở thư mục gốc cũ (backward compatibility)
      const oldFilepath = path.join(this.baseUploadDir, hashFilename)
      if (fs.existsSync(oldFilepath)) {
        const localUrl = `/upload/image/${hashFilename}`
        logger.info(`Image already exists (legacy): ${localUrl}`)
        return localUrl
      }

      // Thư mục tháng
      const monthlyDir = this.getMonthlyDir()
      
      // Lấy tên file gốc hoặc dùng hash
      let originalName = ''
      try {
        const urlObj = new URL(imageUrl)
        originalName = path.basename(urlObj.pathname).split('?')[0].split('#')[0]
        originalName = originalName.replace(/[^\w\.\-]/g, '_')
      } catch (e) {}

      const filename = (originalName && originalName.length > 5 && originalName.includes('.')) 
        ? originalName 
        : hashFilename

      const monthlyFilepath = path.join(monthlyDir, filename)
      const monthlyHashFilepath = path.join(monthlyDir, hashFilename)

      // Kiểm tra xem đã tồn tại bản nào chưa
      if (fs.existsSync(monthlyFilepath)) {
        const localUrl = `${this.getMonthlyUrlPath()}/${filename}`
        logger.info(`Image already exists: ${localUrl}`)
        return localUrl
      }
      if (fs.existsSync(monthlyHashFilepath)) {
        const localUrl = `${this.getMonthlyUrlPath()}/${hashFilename}`
        logger.info(`Image already exists (hash): ${localUrl}`)
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
      try {
        fs.writeFileSync(monthlyFilepath, response.data)
      } catch (writeErr: any) {
        if (writeErr.code === 'EACCES') {
          logger.error(`Permission denied: ${monthlyFilepath}. Please run 'sudo chown -R 777 public/upload' or similar on server.`)
        }
        throw writeErr
      }

      const localUrl = `${this.getMonthlyUrlPath()}/${filename}`
      logger.success(`Image saved: ${localUrl}`)

      return localUrl
    } catch (error: any) {
      if (error.code === 'EACCES') {
        logger.error(`Failed to download image due to permissions: ${imageUrl}`, error)
      } else {
        logger.error(`Failed to download image: ${imageUrl}`, error)
      }
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
