export type Locale = 'en' | 'es'

export interface AuthorMeta {
  name: string
  image: string
  role: Record<Locale, string>
}

export interface PostFile {
  date: string
  /** Legacy single-author key. Still supported; `authors` takes precedence. */
  author?: string
  /** One or more author keys (from `authors.ts`). Use for multi-author posts. */
  authors?: string[]
  title: Record<Locale, string>
  excerpt: Record<Locale, string>
  body: Record<Locale, string[]>
  reference?: Record<Locale, string>
}

export interface Post extends PostFile {
  id: string
}
