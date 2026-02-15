import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { IGenre } from '@/types/common.types'

class GenreRepository {
  async findBySlug(slug: string) {
    return prisma.genre.findUnique({
      where: { slug },
    })
  }

  async upsert(data: IGenre) {
    try {
      const genre = await prisma.genre.upsert({
        where: { slug: data.slug },
        create: data,
        update: {
          name: data.name,
          description: data.description,
          sourceUrl: data.sourceUrl,
        },
      })

      logger.success(`Upserted genre: ${genre.name}`)
      return genre
    } catch (error) {
      logger.error(`Failed to upsert genre: ${data.slug}`, error)
      throw error
    }
  }

  async findOrCreate(name: string, slug: string): Promise<string> {
    const existing = await this.findBySlug(slug)
    
    if (existing) {
      return existing.id
    }

    const genre = await this.upsert({
      name,
      slug,
    })

    return genre.id
  }

  async findOrCreateMany(genres: Array<{ name: string; slug: string }>): Promise<string[]> {
    return Promise.all(
      genres.map(g => this.findOrCreate(g.name, g.slug))
    )
  }
}

export const genreRepository = new GenreRepository()
