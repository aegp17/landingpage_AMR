<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../../i18n'
import PrimaryButton from './PrimaryButton.vue'

const { t } = useI18n()

const form = ref({
  name: '',
  email: '',
  company: '',
  message: '',
})

const sending = ref(false)
const status = ref<'idle' | 'success' | 'error'>('idle')

async function handleSubmit() {
  sending.value = true
  status.value = 'idle'

  try {
    const response = await fetch('https://formsubmit.co/ajax/b47c1e2a6f8d3e5a9c0b4d7f1e3a5c8d', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: form.value.name,
        email: form.value.email,
        company: form.value.company,
        message: form.value.message,
        _subject: 'Ramyx Lab — Nuevo contacto desde la web',
        _honey: '',
        _captcha: 'true',
      }),
    })

    if (response.ok) {
      status.value = 'success'
      form.value = { name: '', email: '', company: '', message: '' }
    } else {
      status.value = 'error'
    }
  } catch {
    status.value = 'error'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <form class="contact-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label :for="'cf-name'">{{ t.contact.form.name }}</label>
      <input id="cf-name" v-model="form.name" type="text" required />
    </div>

    <div class="form-group">
      <label :for="'cf-email'">{{ t.contact.form.email }}</label>
      <input id="cf-email" v-model="form.email" type="email" required />
    </div>

    <div class="form-group">
      <label :for="'cf-company'">{{ t.contact.form.company }}</label>
      <input id="cf-company" v-model="form.company" type="text" />
    </div>

    <div class="form-group">
      <label :for="'cf-message'">{{ t.contact.form.message }}</label>
      <textarea id="cf-message" v-model="form.message" rows="5" required></textarea>
    </div>

    <PrimaryButton type="submit" :disabled="sending">
      {{ sending ? t.contact.form.sending : t.contact.form.submit }}
    </PrimaryButton>

    <p v-if="status === 'success'" class="msg success">{{ t.contact.form.success }}</p>
    <p v-if="status === 'error'" class="msg error">{{ t.contact.form.error }}</p>
  </form>
</template>

<style scoped>
.contact-form {
  max-width: 540px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 0.35rem;
}

input,
textarea {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  color: #0f172a;
  transition: border-color 0.2s;
  background: #fff;
  box-sizing: border-box;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

textarea {
  resize: vertical;
}

.msg {
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.success {
  color: #059669;
}

.error {
  color: #dc2626;
}
</style>
