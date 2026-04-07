import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Sync html lang attribute with stored locale on initial load
const storedLocale = localStorage.getItem('locale')
if (storedLocale === 'es') {
  document.documentElement.lang = 'es'
}

createApp(App).mount('#app')
