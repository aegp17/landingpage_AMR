<script setup lang="ts">
import { useI18n } from '../../i18n'
import SectionTitle from '../ui/SectionTitle.vue'

const { t } = useI18n()
</script>

<template>
  <section id="skills" class="skills">
    <div class="container">
      <SectionTitle :title="t.skills.title" :subtitle="t.skills.subtitle" />
      <div class="categories">
        <div v-for="(category, i) in t.skills.categories" :key="i" class="category">
          <h3 class="category-title">{{ category.label }}</h3>
          <div class="tags">
            <span v-for="tag in category.items" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skills {
  padding: 5rem 1.5rem;
  background: #fff;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

.categories {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.25rem;
}

.category {
  padding: 1.75rem 1.75rem 2rem;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.04), rgba(99, 102, 241, 0.01));
  border: 1px solid rgba(99, 102, 241, 0.12);
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}

.category:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.08);
  transform: translateY(-2px);
}

.category-title {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6366f1;
  margin: 0 0 1rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  font-size: 0.85rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
  font-weight: 500;
  border: 1px solid rgba(99, 102, 241, 0.15);
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.tag:hover {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}

@media (max-width: 768px) {
  .categories {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .category {
    padding: 1.5rem 1.25rem 1.75rem;
  }
}
</style>
