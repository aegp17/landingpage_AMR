<script setup lang="ts">
defineProps<{
  name: string
  role: string
  description: string
  skills: string[]
  image: string
}>()
</script>

<template>
  <div class="team-card">
    <div class="avatar">
      <img :src="image" :alt="name" width="180" height="180" loading="lazy" />
    </div>
    <h3>{{ name }}</h3>
    <p class="role">{{ role }}</p>
    <p class="description">{{ description }}</p>
    <div class="skills">
      <span v-for="skill in skills" :key="skill" class="skill-tag">{{ skill }}</span>
    </div>
  </div>
</template>

<style scoped>
.team-card {
  text-align: center;
  padding: 2rem 1.5rem;
  border-radius: 12px;
  background: #fff;
  border: 1px solid rgba(99, 102, 241, 0.12);
  transition: all 0.3s;
}

.team-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.1);
}

.avatar {
  width: 180px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto 1.25rem;
  background: rgba(99, 102, 241, 0.06);
  border: 3px solid rgba(99, 102, 241, 0.25);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.role {
  font-size: 0.85rem;
  color: #6366f1;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.description {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
}

.skill-tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  font-weight: 500;
}
</style>
