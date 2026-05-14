<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '../i18n'
import { posts, authors } from '../research'
import type { Post } from '../research'
import { useRouteHead, postJsonLd } from '../seo/head'
import { homePath, postPath, absoluteUrl } from '../seo/site'
import NotFound from './NotFound.vue'

const route = useRoute()
const { t, locale } = useI18n()

const slug = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw) ? raw[0] : raw ?? ''
})

const post = computed<Post | undefined>(() => posts.find((p) => p.id === slug.value))

const author = computed(() => {
  const p = post.value
  if (!p) return null
  return authors[p.author] ?? null
})

function formatDate(iso: string, l: 'en' | 'es'): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(l === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

useRouteHead(
  computed(() => {
    const p = post.value
    const a = author.value
    if (!p || !a) {
      return {
        locale: locale.value,
        path: route.path || homePath(locale.value),
        altPath: homePath(locale.value === 'en' ? 'es' : 'en'),
        title: `Not found | Agentic-AMR Consultants`,
        description: '',
        ogType: 'website' as const,
        extraScripts: [],
      }
    }
    const path = postPath(locale.value, p.id)
    const altPath = postPath(locale.value === 'en' ? 'es' : 'en', p.id)
    const title = `${p.title[locale.value]} | Agentic-AMR Consultants`
    const description = p.excerpt[locale.value]
    return {
      locale: locale.value,
      path,
      altPath,
      title,
      description,
      ogType: 'article' as const,
      extraScripts: [
        postJsonLd({
          locale: locale.value,
          postId: p.id,
          postUrl: absoluteUrl(path),
          altUrl: absoluteUrl(altPath),
          title: p.title[locale.value],
          description: p.excerpt[locale.value],
          datePublished: p.date,
          authorName: a.name,
          authorRole: a.role[locale.value],
        }),
      ],
    }
  }),
)
</script>

<template>
  <NotFound v-if="!post || !author" />
  <main v-else class="research-post">
    <article class="container">
      <router-link :to="homePath(locale)" class="back-link">← {{ t.research.back }}</router-link>
      <header class="post-header">
        <div class="byline">
          <img
            :src="author.image"
            :alt="author.name"
            class="avatar"
            width="56"
            height="56"
            loading="lazy"
          />
          <div>
            <div class="name">{{ author.name }}</div>
            <div class="role">{{ author.role[locale] }} · {{ formatDate(post.date, locale) }}</div>
          </div>
        </div>
        <h1>{{ post.title[locale] }}</h1>
        <p class="excerpt">{{ post.excerpt[locale] }}</p>
      </header>
      <div class="body">
        <p v-for="(para, i) in post.body[locale]" :key="i">{{ para }}</p>
      </div>
      <footer v-if="post.reference" class="reference">
        <div class="reference-label">{{ t.research.reference }}</div>
        <p>{{ post.reference[locale] }}</p>
      </footer>
      <aside class="cta">
        <div class="cta-text">
          <h3>{{ t.research.ctaTitle }}</h3>
          <p>{{ t.research.ctaSubtitle }}</p>
        </div>
        <router-link :to="`${homePath(locale)}#contact`" class="cta-button">
          {{ t.research.ctaButton }} →
        </router-link>
      </aside>
    </article>
  </main>
</template>

<style scoped>
.research-post {
  padding: 7rem 1.5rem 5rem;
  background: linear-gradient(180deg, #fafbff 0%, #ffffff 100%);
  min-height: 100vh;
}

.container {
  max-width: 760px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 16px;
  padding: 2.5rem;
}

.back-link {
  display: inline-block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6366f1;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #4f46e5;
}

.post-header {
  margin-bottom: 1.75rem;
}

.byline {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(99, 102, 241, 0.25);
}

.name {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.role {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.15rem;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.25;
  margin: 0 0 0.75rem;
}

.excerpt {
  font-size: 1.05rem;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.body p {
  font-size: 1rem;
  color: #334155;
  line-height: 1.75;
  margin: 0 0 1.1rem;
}

.body p:last-child {
  margin-bottom: 0;
}

.reference {
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(99, 102, 241, 0.15);
}

.reference-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
}

.reference p {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.6;
  font-style: italic;
  margin: 0;
}

.cta {
  margin-top: 2rem;
  padding: 1.5rem 1.75rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  border: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
}

.cta-text h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.3rem;
}

.cta-text p {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

.cta-button {
  flex-shrink: 0;
  background: #6366f1;
  color: #fff;
  border: none;
  padding: 0.7rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.cta-button:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

@media (max-width: 640px) {
  .research-post {
    padding: 6rem 1rem 3rem;
  }

  .container {
    padding: 1.75rem 1.25rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .cta {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
}
</style>
