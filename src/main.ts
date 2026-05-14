import { ViteSSG } from 'vite-ssg'
import './style.css'
import App from './App.vue'
import { routes, ssgRoutes } from './router/routes'

// vite-ssg owns app/router/head setup. It will iterate `routes` and prerender
// every entry in `includedRoutes` at build time.
export const createApp = ViteSSG(
  App,
  {
    routes,
    // History mode (default). vite-ssg crawls these paths and writes them as
    // dist/<path>/index.html. Catch-all + redirects are intentionally excluded.
    base: '/',
  },
  ({ router, isClient }) => {
    if (!isClient) return

    // UX hint: if the user is on `/` (which will redirect to `/en/`) and they
    // previously chose Spanish, send them to `/es/` instead. This only runs on
    // the client so it never affects what gets prerendered.
    try {
      const stored = localStorage.getItem('locale')
      router.beforeEach((to, _from, next) => {
        if (to.path === '/' && stored === 'es') {
          next('/es/')
        } else {
          next()
        }
      })
    } catch {
      /* localStorage unavailable — ignore */
    }
  },
)

// Surface the SSG include list so vite.config.ts can pass it through.
export { ssgRoutes }
