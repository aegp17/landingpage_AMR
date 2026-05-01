import type { AuthorMeta } from './types'

export const authors: Record<string, AuthorMeta> = {
  angel: {
    name: 'Angel Gil',
    image: '/angel.png',
    role: { en: 'COO', es: 'COO' },
  },
  marxjhony: {
    name: 'Marxjhony Jerez',
    image: '/marxjhony.jpeg',
    role: { en: 'CEO', es: 'CEO' },
  },
  ricardo: {
    name: 'Ricardo Dos Santos',
    image: '/ricardo.jpeg',
    role: { en: 'CTO', es: 'CTO' },
  },
}
