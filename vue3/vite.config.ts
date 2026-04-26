import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// 本地沙箱: base = /api/vue3/
// GitHub Pages: base = /nianyavue/
const base = process.env.VITE_BASE || '/api/vue3/'

export default defineConfig({
  base,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
