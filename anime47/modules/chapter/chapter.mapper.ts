import { IChapter, IChapterRaw } from '@/types/chapter.types'
import { slugify, cleanText, parseNumber } from '@/lib/helpers'
import { logger } from '@/lib/logger'

class ChapterMapper {
  normalize(
    raw: IChapterRaw, 
    storyId: string, 
    sourceUrl: string
  ): IChapter {
    try {
      const title = cleanText(raw.title) || 'Untitled Chapter'
      const slug = slugify(title)
      
      return {
        storyId,
        title,
        slug,
        content: cleanText(raw.content),
        videoUrl: raw.videoUrl?.trim(),
        index: parseNumber(raw.index),
        views: parseNumber(raw.views),
        sourceUrl,
      }
    } catch (error) {
      logger.error('Failed to normalize chapter data', { raw, error })
      throw error
    }
  }

  validate(chapter: Partial<IChapter>): boolean {
    if (!chapter.storyId) {
      logger.warn('Chapter validation failed: missing storyId')
      return false
    }
    
    if (!chapter.title || chapter.title.trim() === '') {
      logger.warn('Chapter validation failed: missing title')
      return false
    }
    
    if (!chapter.slug || chapter.slug.trim() === '') {
      logger.warn('Chapter validation failed: missing slug')
      return false
    }
    
    return true
  }
}

export const chapterMapper = new ChapterMapper()
