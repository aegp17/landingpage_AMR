<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../i18n'
import { posts, authors } from '../../research'
import type { Post } from '../../research'
import SectionTitle from '../ui/SectionTitle.vue'
import ResearchCard from '../ui/ResearchCard.vue'
import { postPath, researchIndexPath } from '../../seo/site'

const { t, locale } = useI18n()

function authorOf(post: Post) {
  return authors[post.author] ?? authors[Object.keys(authors)[0]]
}

const sortedPosts = computed(() => posts.slice(0, 3))
</script>

<template>
  <section id="research" class="research">
    <div class="container">
      <SectionTitle :title="t.research.title" :subtitle="t.research.subtitle" />
      <div v-if="sortedPosts.length" class="grid">
        <ResearchCard
          v-for="post in sortedPosts"
          :key="post.id"
          :to="postPath(locale, post.id)"
          :title="post.title[locale]"
          :excerpt="post.excerpt[locale]"
          :date="post.date"
          :author="authorOf(post)"
          :locale="locale"
          :read-more-label="t.research.readMore"
        />
      </div>
      <div class="footer">
        <router-link :to="researchIndexPath(locale)" class="see-all">
          {{ t.research.seeAll }} →
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.research {
  padding: 5rem 1.5rem;
  background: linear-gradient(180deg, #fafbff 0%, #ffffff 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.footer {
  margin-top: 2.5rem;
  text-align: center;
}

.see-all {
  display: inline-block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #6366f1;
  text-decoration: none;
  padding: 0.65rem 1.4rem;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}

.see-all:hover,
.see-all:focus-visible {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.5);
  transform: translateY(-1px);
}

.see-all:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
</style>
