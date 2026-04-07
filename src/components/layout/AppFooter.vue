<script setup lang="ts">
import { useI18n } from '../../i18n'

const { t } = useI18n()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <p class="tagline">{{ t.footer.tagline }}</p>
      <p class="rights">{{ t.footer.rights }}</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: #0f172a;
  color: rgba(255, 255, 255, 0.7);
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.tagline {
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  color: #818cf8;
}

.rights {
  font-size: 0.8rem;
}
</style>
