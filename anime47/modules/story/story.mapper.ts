import { IStory, IStoryRaw } from '@/types/story.types'
import { slugify, cleanText, parseNumber, parseFloat as parseFloatHelper } from '@/lib/helpers'
import { logger } from '@/lib/logger'

class StoryMapper {
  /**
   * Normalize story data từ raw data
   */
  normalize(raw: IStoryRaw, sourceUrl: string): Omit<IStory, 'genreIds' | 'authorId'> {
    try {
      const title = cleanText(raw.title) || 'Untitled'
      const slug = slugify(title)
      
      return {
        title,
        slug,
        description: cleanText(raw.description),
        coverImage: raw.coverImage?.trim(),
        thumbnail: raw.thumbnail?.trim(),
        status: raw.status?.trim(),
        views: parseNumber(raw.views),
        rating: parseFloatHelper(raw.rating),
        sourceUrl,
        
        // New fields normalization
        alternativeName: cleanText(raw.alternativeName),
        releaseYear: parseNumber(raw.releaseYear),
        director: cleanText(raw.director),
        cast: cleanText(raw.cast),
        duration: cleanText(raw.duration),
        quality: cleanText(raw.quality),
        language: cleanText(raw.language),
        
        // Meta JSON - Lưu TOÀN BỘ raw data (không mất dữ liệu)
        metaJson: raw as any, // Store raw data exactly as crawled
      }
    } catch (error) {
      logger.error('Failed to normalize story data', { raw, error })
      throw error
    }
  }

  /**
   * Validate story data
   */
  validate(story: Partial<IStory>): boolean {
    if (!story.title || story.title.trim() === '') {
      logger.warn('Story validation failed: missing title')
      return false
    }
    
    if (!story.slug || story.slug.trim() === '') {
      logger.warn('Story validation failed: missing slug')
      return false
    }
    
    return true
  }
}

export const storyMapper = new StoryMapper()
