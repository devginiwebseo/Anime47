import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export interface IActorInput {
  name: string
  slug: string
  bio?: string
  avatarUrl?: string
  sourceUrl?: string
}

class ActorRepository {
  async findBySlug(slug: string) {
    return prisma.actors.findUnique({
      where: { slug },
    })
  }

  async upsert(data: IActorInput) {
    try {
      const actor = await prisma.actors.upsert({
        where: { slug: data.slug },
        create: data,
        update: {
          name: data.name,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
          sourceUrl: data.sourceUrl,
        },
      })

      logger.success(`Upserted actor: ${actor.name}`)
      return actor
    } catch (error) {
      logger.error(`Failed to upsert actor: ${data.slug}`, error)
      throw error
    }
  }

  async findOrCreate(name: string, slug: string, sourceUrl?: string): Promise<string> {
    const existing = await this.findBySlug(slug)

    if (existing) {
      return existing.id
    }

    const actor = await this.upsert({
      name,
      slug,
      sourceUrl,
    })

    return actor.id
  }

  async findOrCreateMany(actors: Array<{ name: string; slug: string; sourceUrl?: string }>): Promise<string[]> {
    return Promise.all(
      actors.map(a => this.findOrCreate(a.name, a.slug, a.sourceUrl))
    )
  }
}

export const actorRepository = new ActorRepository()
