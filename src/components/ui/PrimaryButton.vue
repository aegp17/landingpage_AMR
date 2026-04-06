<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary'
  type?: 'button' | 'submit'
  disabled?: boolean
}>()
</script>

<template>
  <button
    class="primary-btn"
    :class="[variant ?? 'primary']"
    :type="type ?? 'button'"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  border: 2px solid transparent;
  font-family: inherit;
}

.primary-btn.primary {
  background: #7faedb;
  color: #fff;
  border-color: #7faedb;
}

.primary-btn.primary:hover:not(:disabled) {
  background: #6a9dcf;
  border-color: #6a9dcf;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(127, 174, 219, 0.35);
}

.primary-btn.secondary {
  background: transparent;
  color: #7faedb;
  border-color: #a9c7e8;
}

.primary-btn.secondary:hover:not(:disabled) {
  background: rgba(169, 199, 232, 0.1);
  border-color: #7faedb;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
