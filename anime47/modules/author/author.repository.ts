import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { IAuthor } from '@/types/common.types'

class AuthorRepository {
  async findBySlug(slug: string) {
    return prisma.authors.findUnique({
      where: { slug },
    })
  }

  async upsert(data: IAuthor) {
    try {
      const author = await prisma.authors.upsert({
        where: { slug: data.slug },
        create: data,
        update: {
          name: data.name,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
          sourceUrl: data.sourceUrl,
        },
      })

      logger.success(`Upserted author: ${author.name}`)
      return author
    } catch (error) {
      logger.error(`Failed to upsert author: ${data.slug}`, error)
      throw error
    }
  }

  async findOrCreate(name: string, slug: string): Promise<string> {
    const existing = await this.findBySlug(slug)
    
    if (existing) {
      return existing.id
    }

    const author = await this.upsert({
      name,
      slug,
    })

    return author.id
  }
}

export const authorRepository = new AuthorRepository()
