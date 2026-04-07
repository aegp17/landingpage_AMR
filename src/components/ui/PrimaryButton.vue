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
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}

.primary-btn.primary:hover:not(:disabled) {
  background: #4f46e5;
  border-color: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.primary-btn.secondary {
  background: transparent;
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.4);
}

.primary-btn.secondary:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.08);
  border-color: #6366f1;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
