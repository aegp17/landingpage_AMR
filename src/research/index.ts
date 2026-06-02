import { authors } from './authors'
import type { AuthorMeta, Locale, Post, PostFile } from './types'

const modules = import.meta.glob<PostFile>('./posts/*.json', {
  eager: true,
  import: 'default',
})

function idFromPath(path: string): string {
  return path.replace(/^\.\/posts\//, '').replace(/\.json$/, '')
}

export const posts: Post[] = Object.entries(modules)
  .map(([path, data]) => ({ ...data, id: idFromPath(path) }))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1))

/** Resolve a post's author keys, accepting both the `authors` array and the legacy `author` field. */
export function authorKeysOf(post: Pick<PostFile, 'author' | 'authors'>): string[] {
  if (post.authors?.length) return post.authors
  if (post.author) return [post.author]
  return []
}

/** Resolve a post's authors to their metadata, in order. Falls back to the first registered author. */
export function authorsOf(post: Pick<PostFile, 'author' | 'authors'>): AuthorMeta[] {
  const resolved = authorKeysOf(post)
    .map((key) => authors[key])
    .filter((a): a is AuthorMeta => Boolean(a))
  return resolved.length ? resolved : [authors[Object.keys(authors)[0]]]
}

/** Join author names into a localized byline, e.g. "A & B" (en) / "A y B" (es). */
export function joinAuthorNames(names: string[], locale: Locale): string {
  if (names.length <= 1) return names[0] ?? ''
  const conjunction = locale === 'es' ? ' y ' : ' & '
  if (names.length === 2) return names.join(conjunction)
  return names.slice(0, -1).join(', ') + conjunction + names[names.length - 1]
}

export { authors }
export type { Post, PostFile, AuthorMeta, Locale } from './types'
