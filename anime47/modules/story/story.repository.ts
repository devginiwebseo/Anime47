import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { IStory } from '@/types/story.types'

class StoryRepository {
  /**
   * Tìm story theo slug
   */
  async findBySlug(slug: string) {
    return prisma.stories.findUnique({
      where: { slug },
      include: {
        authors: true,
        story_genres: {
          include: {
            genres: true,
          },
        },
        story_actors: {
          include: {
            actors: true,
          },
        },
        story_tags: {
          include: {
            tags: true,
          },
        },
      },
    })
  }

  /**
   * Tạo hoặc update story
   */
  async upsert(data: IStory & { actorIds?: string[]; tagIds?: string[] }) {
    try {
      const story = await prisma.stories.upsert({
        where: { slug: data.slug },
        create: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          coverImage: data.coverImage,
          thumbnail: data.thumbnail,
          status: data.status,
          views: data.views,
          rating: data.rating,
          sourceUrl: data.sourceUrl,
          authorId: data.authorId,
          
          // New fields
          alternativeName: data.alternativeName,
          releaseYear: data.releaseYear,
          director: data.director,
          cast: data.cast,
          duration: data.duration,
          quality: data.quality,
          language: data.language,
          keywords: data.keywords,
          
          // Meta JSON
          metaJson: data.metaJson || {},
        },
        update: {
          title: data.title,
          description: data.description,
          coverImage: data.coverImage,
          thumbnail: data.thumbnail,
          status: data.status,
          views: data.views,
          rating: data.rating,
          authorId: data.authorId,
          
          // New fields
          alternativeName: data.alternativeName,
          releaseYear: data.releaseYear,
          director: data.director,
          cast: data.cast,
          duration: data.duration,
          quality: data.quality,
          language: data.language,
          keywords: data.keywords,
          
          // Meta JSON
          metaJson: data.metaJson || {},
        },
      })

      // Update genres (many-to-many)
      if (data.genreIds && data.genreIds.length > 0) {
        // Delete old relations
        await prisma.story_genres.deleteMany({
          where: { storyId: story.id },
        })

        // Create new relations
        await prisma.story_genres.createMany({
          data: data.genreIds.map(genreId => ({
            storyId: story.id,
            genreId,
          })),
          skipDuplicates: true,
        })
      }

      // Update actors (many-to-many)
      if (data.actorIds && data.actorIds.length > 0) {
        // Delete old relations
        await prisma.story_actors.deleteMany({
          where: { storyId: story.id },
        })

        // Create new relations
        await prisma.story_actors.createMany({
          data: data.actorIds.map(actorId => ({
            storyId: story.id,
            actorId,
          })),
          skipDuplicates: true,
        })
      }

      // Update tags (many-to-many)
      if (data.tagIds && data.tagIds.length > 0) {
        // Delete old relations
        await prisma.story_tags.deleteMany({
          where: { storyId: story.id },
        })

        // Create new relations
        await prisma.story_tags.createMany({
          data: data.tagIds.map(tagId => ({
            storyId: story.id,
            tagId,
          })),
          skipDuplicates: true,
        })
      }

      logger.success(`Upserted story: ${story.title} (${story.slug})`)
      
      return story
    } catch (error) {
      logger.error(`Failed to upsert story: ${data.slug}`, error)
      throw error
    }
  }

  /**
   * Tìm tất cả stories
   */
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    
    return prisma.stories.findMany({
      skip,
      take: limit,
      include: {
        authors: true,
        story_genres: {
          include: {
            genres: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Count stories
   */
  async count() {
    return prisma.stories.count()
  }
}

export const storyRepository = new StoryRepository()
