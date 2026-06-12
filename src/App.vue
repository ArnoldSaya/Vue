<template>
  <div class="app-container">
    
    <div class="control-panel no-print">
      <div class="search-box">
        <label for="cui"><strong>Buscar por CUI:</strong></label>
        <input 
          id="cui" 
          type="text" 
          v-model="cuiBusqueda" 
          placeholder="Ej. 20250100" 
          @keyup.enter="consultarBackend"
        />
        <button @click="consultarBackend" :disabled="cargando">
          {{ cargando ? 'Consultando...' : 'Obtener Constancia' }}
        </button>
      </div>
    </div>

    <div v-if="alumnoDatos" class="constancia-papel">
      
      <header class="header-epis">
        <h1>CONSTANCIA DE MATRÍCULA DE LABORATORIO</h1>
        <h2>Escuela Profesional de Ingeniería de Sistemas EPIS</h2>
        <p class="fecha-emision">Emitido el: {{ formatearFecha(fechaEmision) }}</p>
      </header>

      <hr class="linea-division" />

      <section class="seccion-documento">
        <div class="titulo-seccion">DATOS DEL ALUMNO</div>
        <table class="tabla-alumno">
          <tbody>
            <tr>
              <td class="col-label">C.U.I.:</td>
              <td class="col-valor valor-destacado">{{ alumnoDatos.cui }}</td>
            </tr>
            <tr>
              <td class="col-label">Nombre completo:</td>
              <td class="col-valor valor-destacado texto-mayuscula">
                {{ alumnoDatos.full_name }}
              </td>
            </tr>
            <tr>
              <td class="col-label">Email:</td>
              <td class="col-valor texto-minuscula">{{ alumnoDatos.email }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="seccion-documento">
        <div class="titulo-seccion">ASIGNATURAS MATRICULADAS</div>
        
        <table class="tabla-cursos">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">N°</th>
              <th style="width: 12%; text-align: center;">Código</th>
              <th style="width: 43%;">Curso</th>
              <th style="width: 10%; text-align: center;">Año</th>
              <th style="width: 8%; text-align: center;">Grupo</th>
              <th style="width: 10%; text-align: center;">Laboratorio</th>
              <th style="width: 12%;">Docente</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(registro, index) in listaMatriculas" :key="registro.id">
              <td style="text-align: center;">{{ index + 1 }}</td>
              <td style="text-align: center;">{{ registro.workload?.course?.code }}</td>
              <td class="valor-destacado texto-mayuscula">
                {{ registro.workload?.course?.name }} ({{ registro.workload?.course?.acronym }})
              </td>
              <td style="text-align: center;">{{ registro.workload?.course?.year_display }}</td>
              <td style="text-align: center;" class="valor-destacado">{{ registro.workload?.group }}</td>
              <td style="text-align: center;" class="texto-minuscula">{{ registro.workload?.laboratory }}</td>
              <td class="valor-destacado texto-mayuscula">
                {{ registro.workload?.teacher?.full_name || 'POR ASIGNAR' }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <div v-else-if="cargando" class="estado-mensaje">
      <div class="spinner"></div>
      <p>Cargando datos del estudiante desde SisAcad...</p>
    </div>

    <div v-else class="estado-mensaje error-box">
      <p>⚠️ No se encontraron registros para el CUI ingresado.</p>
      <small>Introduce el CUI correcto (Ej. 20250100) en el buscador superior.</small>
      
      <div v-if="errorDebug" class="debug-info">
        <strong>Reporte de Conexión:</strong>
        <pre>{{ errorDebug }}</pre>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const cuiBusqueda = ref('20250100'); 
const alumnoDatos = ref(null);
const listaMatriculas = ref([]);
const fechaEmision = ref('');
const cargando = ref(false);
const errorDebug = ref(null);

// Volvemos a la URL directa real del backend
const BASE_ROUTE_API = 'https://sisacad-enrollments-backend.vercel.app/restful/enrollment-certificate/';

const consultarBackend = async () => {
  if (!cuiBusqueda.value.trim()) return;
  
  cargando.value = true;
  alumnoDatos.value = null;
  listaMatriculas.value = [];
  errorDebug.value = null;
  
  try {
    const urlCompleta = `${BASE_ROUTE_API}?cui=${cuiBusqueda.value.trim()}`;
    console.log("Petición directa de producción hacia:", urlCompleta);

    // Ajuste clave: Usamos credenciales omitidas y modo 'cors' explícito
    // Esto evita que Railway envíe cookies o cabeceras raras que Django rechace
    const response = await fetch(urlCompleta, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor. Código HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("JSON procesado en la nube:", data);

    let resultados = [];
    if (data && data.results) {
      resultados = data.results;
    } else if (Array.isArray(data)) {
      resultados = data;
    }

    if (resultados.length > 0) {
      listaMatriculas.value = resultados;
      alumnoDatos.value = resultados[0].student;
      fechaEmision.value = resultados[0].created;
    } else {
      errorDebug.value = "La consulta se realizó, pero no existen matrículas registradas para este número de CUI.";
    }

  } catch (error) {
    console.error("Error de red detallado:", error);
    errorDebug.value = `${error.message}. Nota: Si estás en la nube, asegúrate de buscar un CUI válido (ej. 20250100).`;
  } finally {
    cargando.value = false;
  }
};

const formatearFecha = (stringFecha) => {
  if (!stringFecha) return '11/06/2026';
  const fecha = new Date(stringFecha);
  if (isNaN(fecha.getTime())) return stringFecha;
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

onMounted(() => {
  consultarBackend();
});
</script>

<style>
/* Reset y estilos de maquetación de la constancia */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f4f6f9;
  color: #333;
}

.app-container {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.control-panel {
  width: 100%;
  max-width: 950px;
  background: white;
  padding: 15px 20px;
  border-radius: 6px;
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-box input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  width: 180px;
}

.search-box button {
  background-color: #164670;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.search-box button:hover {
  background-color: #143754;
}

.constancia-papel {
  width: 100%;
  max-width: 950px;
  background: white;
  padding: 50px 60px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.header-epis {
  text-align: center;
}

.header-epis h1 {
  font-size: 24px;
  color: #164670; 
  margin: 0 0 10px 0;
  font-weight: bold;
  letter-spacing: 0.3px;
}

.header-epis h2 {
  font-size: 16px;
  color: #444;
  margin: 0 0 15px 0;
  font-weight: normal;
}

.fecha-emision {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.linea-division {
  border: 0;
  border-top: 1px solid #ccc;
  margin: 20px 0 30px 0;
}

.seccion-documento {
  margin-bottom: 35px;
}

.titulo-seccion {
  background-color: #f2f4f7;
  color: #111;
  font-size: 13px;
  font-weight: bold;
  padding: 8px 12px;
  border-left: 4px solid #164670;
  margin-bottom: 15px;
}

.tabla-alumno {
  width: 100%;
  border-collapse: collapse;
}

.tabla-alumno td {
  padding: 6px 12px;
  font-size: 14px;
}

.col-label {
  width: 15%;
  font-weight: bold;
}

.col-valor {
  width: 85%;
}

.tabla-cursos {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.tabla-cursos th {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 10px;
  font-size: 13px;
  font-weight: bold;
  text-align: left;
}

.tabla-cursos td {
  border: 1px solid #e2e8f0;
  padding: 10px;
  font-size: 13px;
  color: #333;
}

.valor-destacado { font-weight: bold; }
.texto-mayuscula { text-transform: uppercase; }
.texto-minuscula { text-transform: lowercase; }

.estado-mensaje {
  width: 100%;
  max-width: 950px;
  background: white;
  padding: 40px;
  text-align: center;
  border-radius: 4px;
  color: #555;
}

.error-box {
  border-top: 4px solid #dd4b39;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border-left-color: #164670;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.debug-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #fdf2f2;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  text-align: left;
  color: #721c24;
  font-size: 13px;
}

.debug-info pre {
  margin: 10px 0 0 0;
  background: #fff;
  padding: 10px;
  border: 1px solid #e3a8af;
  overflow-x: auto;
  font-family: monospace;
}

@media print {
  .no-print { display: none !important; }
  body { background: white; }
  .app-container { padding: 0; }
  .constancia-papel { box-shadow: none; padding: 0; width: 100%; }
}
</style>