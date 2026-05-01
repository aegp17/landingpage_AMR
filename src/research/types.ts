export type Locale = 'en' | 'es'

export interface AuthorMeta {
  name: string
  image: string
  role: Record<Locale, string>
}

export interface PostFile {
  date: string
  author: string
  title: Record<Locale, string>
  excerpt: Record<Locale, string>
  body: Record<Locale, string[]>
  reference?: Record<Locale, string>
}

export interface Post extends PostFile {
  id: string
}
