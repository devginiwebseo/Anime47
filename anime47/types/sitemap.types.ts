export interface ISitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

export interface ISitemapIndex {
  loc: string
  lastmod?: string
}

export enum SitemapType {
  INDEX = 'index',
  STORY = 'story',
  CHAPTER = 'chapter',
  AUTHOR = 'author',
  GENRE = 'genre',
  UNKNOWN = 'unknown'
}

export interface IParsedSitemap {
  type: SitemapType
  urls: ISitemapUrl[]
}
