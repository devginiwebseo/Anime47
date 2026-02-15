import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { IChapter } from '@/types/chapter.types'

class ChapterRepository {
  async findBySlug(storyId: string, slug: string) {
    return prisma.chapter.findUnique({
      where: {
        storyId_slug: {
          storyId,
          slug,
        },
      },
    })
  }

  async upsert(data: IChapter) {
    try {
      const chapter = await prisma.chapter.upsert({
        where: {
          storyId_slug: {
            storyId: data.storyId,
            slug: data.slug,
          },
        },
        create: data,
        update: {
          title: data.title,
          content: data.content,
          videoUrl: data.videoUrl,
          index: data.index,
          views: data.views,
        },
      })

      logger.success(`Upserted chapter: ${chapter.title} (${chapter.slug})`)
      return chapter
    } catch (error) {
      logger.error(`Failed to upsert chapter: ${data.slug}`, error)
      throw error
    }
  }

  async findByStory(storyId: string) {
    return prisma.chapter.findMany({
      where: { storyId },
      orderBy: { index: 'asc' },
    })
  }

  async count() {
    return prisma.chapter.count()
  }
}

export const chapterRepository = new ChapterRepository()
