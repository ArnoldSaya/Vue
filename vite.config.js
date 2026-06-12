import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // Configuración para desarrollo local
    proxy: {
      '/api-universidad': {
        target: 'https://sisacad-enrollments-backend.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-universidad/, '')
      }
    }
  },
  preview: {
    allowedHosts: true, // Permite que Railway muestre la app
    port: process.env.PORT || 4173,
    host: '0.0.0.0',
    // Configuración Proxy para producción en Railway
    proxy: {
      '/api-universidad': {
        target: 'https://sisacad-enrollments-backend.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api-universidad/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        }
      }
    }
  }
})