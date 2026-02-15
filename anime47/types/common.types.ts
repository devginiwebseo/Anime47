export interface IAuthor {
  name: string
  slug: string
  bio?: string
  avatarUrl?: string
  sourceUrl?: string
}

export interface IGenre {
  name: string
  slug: string
  description?: string
  sourceUrl?: string
}
