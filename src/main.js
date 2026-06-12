import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// ESTA ES LA LÍNEA LITERAL QUE FALTA (Registra la API de forma global en toda la app)
app.config.globalProperties.$apiBase = 'https://sisacad-enrollments-backend.vercel.app/restful/enrollment-certificate/';

app.config.errorHandler = (err, instance, info) => {
    console.error("Error global de Vue detectado:", err);
};

app.mount('#app')