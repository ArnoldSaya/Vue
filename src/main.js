import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// Configuración global para manejo de errores de red en la app
app.config.errorHandler = (err, instance, info) => {
    console.error("Error global de Vue detectado:", err);
};

app.mount('#app')