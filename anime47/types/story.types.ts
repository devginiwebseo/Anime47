// Normalized story data (chuẩn hóa để lưu DB)
export interface IStory {
  slug: string
  title: string
  description?: string
  alternativeName?: string
  coverImage?: string
  thumbnail?: string
  sourceUrl: string
  status?: string
  authorId?: string
  genreIds?: string[]
  
  // New detailed fields
  releaseYear?: number
  director?: string
  cast?: string
  duration?: string
  quality?: string
  language?: string
  keywords?: string
  
  views?: number
  rating?: number
  
  // Meta JSON
  metaJson?: any // Raw data object
}

// Raw data từ crawler (chưa chuẩn hóa)
export interface IStoryRaw {
  title: string
  description?: string
  alternativeName?: string
  coverImage?: string
  thumbnail?: string
  status?: string
  views?: string | number | undefined
  rating?: string | number | undefined
  author?: string
  genres?: string[]
  
  // New detailed fields
  releaseYear?: string | undefined
  director?: string | undefined
  cast?: string | undefined
  duration?: string | undefined
  quality?: string | undefined
  language?: string | undefined
  keywords?: string | undefined
}
