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
      <img :src="image" :alt="name" />
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
  border: 1px solid rgba(169, 199, 232, 0.25);
  transition: all 0.3s;
}

.team-card:hover {
  border-color: #a9c7e8;
  box-shadow: 0 8px 30px rgba(169, 199, 232, 0.15);
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 1.25rem;
  background: rgba(169, 199, 232, 0.15);
  border: 3px solid #a9c7e8;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.role {
  font-size: 0.85rem;
  color: #7faedb;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.description {
  font-size: 0.88rem;
  color: #6b7280;
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
  background: rgba(169, 199, 232, 0.15);
  color: #7faedb;
  font-weight: 500;
}
</style>
