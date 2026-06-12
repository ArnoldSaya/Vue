import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// LÍNEA CLAVE: Registra la API global con bypass de CORS integrado para producción
app.config.globalProperties.$apiBase = 'https://corsproxy.io/?' + encodeURIComponent('https://sisacad-enrollments-backend.vercel.app/restful/enrollment-certificate/');

app.config.errorHandler = (err, instance, info) => {
    console.error("Error global de Vue detectado:", err);
};

app.mount('#app')