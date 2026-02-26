import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export interface ITagInput {
  name: string
  slug: string
  description?: string
}

class TagRepository {
  async findBySlug(slug: string) {
    return prisma.tags.findUnique({
      where: { slug },
    })
  }

  async upsert(data: ITagInput) {
    try {
      const tag = await prisma.tags.upsert({
        where: { slug: data.slug },
        create: data,
        update: {
          name: data.name,
          description: data.description,
        },
      })

      return tag
    } catch (error) {
      logger.error(`Failed to upsert tag: ${data.slug}`, error)
      throw error
    }
  }

  async findOrCreate(name: string, slug: string): Promise<string> {
    const existing = await this.findBySlug(slug)

    if (existing) {
      return existing.id
    }

    const tag = await this.upsert({ name, slug })
    return tag.id
  }

  async findOrCreateMany(tags: Array<{ name: string; slug: string }>): Promise<string[]> {
    return Promise.all(
      tags.map(t => this.findOrCreate(t.name, t.slug))
    )
  }
}

export const tagRepository = new TagRepository()
