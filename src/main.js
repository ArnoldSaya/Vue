import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// La línea de configuración global que te pidió el profesor apuntando directo a su Vercel
app.config.globalProperties.$apiBase = 'https://sisacad-enrollments-backend.vercel.app/restful/enrollment-certificate/';

app.config.errorHandler = (err, instance, info) => {
    console.error("Error global de Vue detectado:", err);
};

app.mount('#app')