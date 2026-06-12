import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  preview: {
    allowedHosts: true, // Esto quita el bloqueo de Railway
    port: process.env.PORT || 4173,
    host: '0.0.0.0'
  }
})