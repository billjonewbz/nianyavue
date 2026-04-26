import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

// 本地沙箱: /api/vue3/
// GitHub Pages: /nianyavue/
const base = import.meta.env.VITE_BASE || '/api/vue3/'

const router = createRouter({
  history: createWebHistory(import.meta.env.DEV ? '/' : base),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
  ],
})

export default router
