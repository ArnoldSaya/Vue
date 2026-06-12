import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  preview: {
    allowedHosts: true, 
    // ESTA ES LA LÍNEA LITERAL QUE FALTA (Asegura que Railway asigne el puerto numérico correcto)
    port: parseInt(process.env.PORT) || 4173,
    host: '0.0.0.0'
  }
})