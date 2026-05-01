<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '../../i18n'
import { posts, authors } from '../../research'
import type { Post } from '../../research'
import SectionTitle from '../ui/SectionTitle.vue'
import ResearchCard from '../ui/ResearchCard.vue'
import ResearchModal from '../ui/ResearchModal.vue'

const { t, locale } = useI18n()

const openPost = ref<Post | null>(null)

function authorOf(post: Post) {
  return authors[post.author] ?? authors[Object.keys(authors)[0]]
}

function goToContact() {
  openPost.value = null
  requestAnimationFrame(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  })
}

const sortedPosts = computed(() => posts)
</script>

<template>
  <section id="research" class="research">
    <div class="container">
      <SectionTitle :title="t.research.title" :subtitle="t.research.subtitle" />
      <div v-if="sortedPosts.length" class="grid">
        <ResearchCard
          v-for="post in sortedPosts"
          :key="post.id"
          :title="post.title[locale]"
          :excerpt="post.excerpt[locale]"
          :date="post.date"
          :author="authorOf(post)"
          :locale="locale"
          :read-more-label="t.research.readMore"
          @open="openPost = post"
        />
      </div>
    </div>

    <ResearchModal
      v-if="openPost"
      :post="openPost"
      :author="authorOf(openPost)"
      :locale="locale"
      :close-label="t.research.close"
      :reference-label="t.research.reference"
      :cta-title="t.research.ctaTitle"
      :cta-subtitle="t.research.ctaSubtitle"
      :cta-button="t.research.ctaButton"
      @close="openPost = null"
      @contact="goToContact"
    />
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
</style>
