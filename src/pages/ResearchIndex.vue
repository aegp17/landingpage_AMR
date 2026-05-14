<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../i18n'
import { posts, authors } from '../research'
import type { Post } from '../research'
import ResearchCard from '../components/ui/ResearchCard.vue'
import { useRouteHead, researchIndexJsonLd } from '../seo/head'
import { researchIndexPath, feedPath, absoluteUrl } from '../seo/site'

const { t, locale } = useI18n()

function authorOf(post: Post) {
  return authors[post.author] ?? authors[Object.keys(authors)[0]]
}

const sortedPosts = computed(() => posts)

useRouteHead(
  computed(() => ({
    locale: locale.value,
    path: researchIndexPath(locale.value),
    altPath: researchIndexPath(locale.value === 'en' ? 'es' : 'en'),
    title: `${t.value.research.indexTitle} | Agentic-AMR Consultants`,
    description: t.value.research.indexDescription,
    ogType: 'website',
    feedUrl: absoluteUrl(feedPath(locale.value)),
    feedTitle:
      locale.value === 'es' ? 'Investigación · Agentic-AMR' : 'Research · Agentic-AMR',
    extraScripts: [
      researchIndexJsonLd(
        locale.value,
        sortedPosts.value.map((p) => ({
          id: p.id,
          title: p.title[locale.value],
          description: p.excerpt[locale.value],
          datePublished: p.date,
          authorName: authorOf(p).name,
        })),
        t.value.research.indexTitle,
        t.value.research.indexDescription,
      ),
    ],
  })),
)
</script>

<template>
  <main class="research-index">
    <div class="container">
      <header class="header">
        <h1>{{ t.research.indexTitle }}</h1>
        <p class="subtitle">{{ t.research.indexSubtitle }}</p>
        <a class="feed-link" :href="feedPath(locale)" rel="alternate" type="application/atom+xml">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M6.18 17.82a2.18 2.18 0 1 1-4.36 0 2.18 2.18 0 0 1 4.36 0M2 6.44V9.5c7.18 0 13 5.82 13 13h3.06C18.06 13.34 10.66 6.44 2 6.44m0-3.06V6.5c10.96 0 19.84 8.88 19.84 19.84"/>
          </svg>
          <span>{{ t.research.subscribe }}</span>
        </a>
      </header>
      <div v-if="sortedPosts.length" class="grid">
        <ResearchCard
          v-for="post in sortedPosts"
          :key="post.id"
          :to="`/${locale}/research/${post.id}/`"
          :title="post.title[locale]"
          :excerpt="post.excerpt[locale]"
          :date="post.date"
          :author="authorOf(post)"
          :locale="locale"
          :read-more-label="t.research.readMore"
        />
      </div>
      <p v-else class="empty">{{ t.research.indexEmpty }}</p>
    </div>
  </main>
</template>

<style scoped>
.research-index {
  padding: 7rem 1.5rem 5rem;
  background: linear-gradient(180deg, #fafbff 0%, #ffffff 100%);
  min-height: 100vh;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.75rem;
}

.subtitle {
  font-size: 1.05rem;
  color: #475569;
  line-height: 1.65;
  max-width: 680px;
  margin: 0 auto 1.25rem;
}

.feed-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #ea7600;
  background: rgba(234, 118, 0, 0.08);
  border: 1px solid rgba(234, 118, 0, 0.2);
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}

.feed-link:hover,
.feed-link:focus-visible {
  background: rgba(234, 118, 0, 0.14);
  border-color: rgba(234, 118, 0, 0.34);
  transform: translateY(-1px);
}

.feed-link:focus-visible {
  outline: 2px solid #ea7600;
  outline-offset: 2px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.empty {
  text-align: center;
  color: #64748b;
  font-size: 1rem;
  padding: 3rem 0;
}

@media (max-width: 640px) {
  .research-index {
    padding: 6rem 1rem 3rem;
  }

  .header h1 {
    font-size: 1.65rem;
  }
}
</style>
