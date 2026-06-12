import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  preview: {
    allowedHosts: true, 
    // Asegura que Railway asigne el puerto numérico dinámico correcto en producción
    port: parseInt(process.env.PORT) || 4173,
    host: '0.0.0.0'
  }
})