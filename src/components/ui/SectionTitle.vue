<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="section-title">
    <h2>{{ title }}</h2>
    <p v-for="(para, i) in (subtitle?.split('\n\n') ?? [])" :key="i">{{ para }}</p>
  </div>
</template>

<style scoped>
.section-title {
  text-align: center;
  margin-bottom: 3.5rem;
}

.section-title h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.section-title p {
  font-size: 1.05rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.section-title p + p {
  margin-top: 0.75rem;
}
</style>
