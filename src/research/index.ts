import type { Post, PostFile } from './types'

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

export { authors } from './authors'
export type { Post, PostFile, AuthorMeta, Locale } from './types'
