export interface IChapter {
  storyId: string
  title: string
  slug: string
  content?: string
  videoUrl?: string
  index: number
  views?: number
  sourceUrl?: string
}

export interface IChapterRaw {
  title?: string
  content?: string
  videoUrl?: string
  index?: string | number
  views?: string | number
}
