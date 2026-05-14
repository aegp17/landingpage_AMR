import type { RouteRecordRaw } from 'vue-router'
import Home from '../pages/Home.vue'
import ResearchIndex from '../pages/ResearchIndex.vue'
import ResearchPost from '../pages/ResearchPost.vue'
import NotFound from '../pages/NotFound.vue'
import { allRoutePaths } from '../seo/site'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/en/',
  },
  {
    path: '/en',
    redirect: '/en/',
  },
  {
    path: '/es',
    redirect: '/es/',
  },
  {
    path: '/en/',
    name: 'home-en',
    component: Home,
    meta: { locale: 'en' },
  },
  {
    path: '/es/',
    name: 'home-es',
    component: Home,
    meta: { locale: 'es' },
  },
  {
    path: '/en/research/',
    name: 'research-index-en',
    component: ResearchIndex,
    meta: { locale: 'en' },
  },
  {
    path: '/es/research/',
    name: 'research-index-es',
    component: ResearchIndex,
    meta: { locale: 'es' },
  },
  {
    path: '/en/research/:slug/',
    name: 'research-en',
    component: ResearchPost,
    meta: { locale: 'en' },
  },
  {
    path: '/es/research/:slug/',
    name: 'research-es',
    component: ResearchPost,
    meta: { locale: 'es' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
  },
]

/**
 * The exhaustive list of static paths vite-ssg should prerender. Excludes
 * the root redirect and the catch-all (vite-ssg can't statically serve those).
 */
export const ssgRoutes: string[] = allRoutePaths()
