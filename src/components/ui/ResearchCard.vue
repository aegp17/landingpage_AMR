<script setup lang="ts">
import { computed } from 'vue'
import { joinAuthorNames } from '../../research'
import type { AuthorMeta, Locale } from '../../research'

const props = defineProps<{
  to: string
  title: string
  excerpt: string
  date: string
  authors: AuthorMeta[]
  locale: Locale
  readMoreLabel: string
}>()

const authorNames = computed(() => joinAuthorNames(props.authors.map((a) => a.name), props.locale))
const authorRoles = computed(() => props.authors.map((a) => a.role[props.locale]).join(' · '))

function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <router-link :to="to" class="research-card">
    <div class="meta">
      <div class="avatars">
        <img
          v-for="(author, i) in authors"
          :key="i"
          :src="author.image"
          :alt="author.name"
          class="avatar"
          width="40"
          height="40"
          loading="lazy"
        />
      </div>
      <div class="byline">
        <span class="name">{{ authorNames }}</span>
        <span class="role">{{ authorRoles }} · {{ formatDate(date, locale) }}</span>
      </div>
    </div>
    <h3>{{ title }}</h3>
    <p class="excerpt">{{ excerpt }}</p>
    <span class="read-more">{{ readMoreLabel }} →</span>
  </router-link>
</template>

<style scoped>
.research-card {
  background: #fff;
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 12px;
  padding: 1.75rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  text-align: left;
  text-decoration: none;
  color: inherit;
}

.research-card:hover {
  border-color: rgba(99, 102, 241, 0.35);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatars {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1.5px rgba(99, 102, 241, 0.3);
  flex-shrink: 0;
}

.avatars .avatar:not(:first-child) {
  margin-left: -12px;
}

.byline {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
}

.role {
  font-size: 0.75rem;
  color: #64748b;
}

h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  margin: 0;
}

.excerpt {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  flex-grow: 1;
}

.read-more {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6366f1;
  margin-top: 0.25rem;
}
</style>
