<template>
  <div class="lecciones-container">
    <div class="content-area">
      <!-- Vista de cursos -->
      <template v-if="!selectedCourseId">
        <h2 class="section-title">{{ t('professionalDevelopment') }}</h2>

        <div class="courses-grid">
          <article
            v-for="course in coursesWithState"
            :key="course.id"
            class="course-card"
            @click="selectCourse(course.id)">
            
            <div class="card-tech-icons">
              <img
                v-for="tech in course.techs"
                :key="tech"
                :src="getTechIcon(tech)"
                :alt="tech"
                :title="tech"
                class="card-icon">
            </div>

            <h3 class="course-title">{{ getLocalizedText(course.title) }}</h3>

            <div class="course-progress-info">
              <span class="progress-label">{{ t('lessonsUpper') }}</span>
              <span class="progress-numbers">{{ completedLessons(course) }}/{{ course.lessons.length }}</span>
            </div>
          </article>
        </div>
      </template>

      <!-- Vista de curso seleccionado -->
      <template v-else-if="selectedCourseId && !selectedLessonId">
        <div class="course-detail-header">
          <button class="back-btn" @click="selectedCourseId = ''" :title="t('back')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <div>
            <h2>{{ getLocalizedText(selectedCourse.title) }}</h2>
            <p class="course-desc">{{ getLocalizedText(selectedCourse.description) }}</p>
          </div>
        </div>

        <div class="languages-section">
          <div
            v-for="language in selectedCourse.techs"
            :key="language"
            class="language-group">
            
            <button 
              class="language-header"
              @click="toggleLanguage(language)">
              <span class="lang-name">
                <img :src="getTechIcon(language)" :alt="language" class="language-header-icon">
                {{ language }}
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                class="expand-icon"
                :class="{ expanded: expandedLanguages[language] }">
                <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
              </svg>
            </button>

            <div v-if="expandedLanguages[language]" class="lessons-list">
              <div
                v-for="(level, index) in getVisibleLevelsByLanguage(language)"
                :key="`${language}-${level.id}`"
                class="lesson-row"
                :class="getTheoryLevelClass(language, level)"
                @click="openTheoryLevel(language, level)">
                
                <span class="lesson-lock">{{ isTheoryLevelUnlocked(language, level.id) ? '🔓' : '🔒' }}</span>
                <div class="lesson-item-info">
                  <p class="lesson-item-name">{{ getDisplayLevelName(level) }}</p>
                  <p class="lesson-item-level">{{ t('level') }} {{ level.id }}</p>
                </div>
                <span v-if="level.completed" class="lesson-completed">✓</span>
              </div>

              <p
                v-if="getVisibleLevelsByLanguage(language).length === 0"
                class="lesson-empty">
                {{ t('noCurriculumForLanguage') }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- Vista de apuntes de lección -->
      <template v-else-if="selectedLessonId">
        <div class="lesson-detail-header">
          <button class="back-btn" @click="goBackToCourse()" :title="t('back')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <div>
            <h2>{{ getLocalizedText(selectedLesson.title) }}</h2>
            <p class="lesson-meta">{{ getLocalizedText(selectedCourse.title) }} - {{ t('level') }} {{ getLessonLevelNumber() }}</p>
          </div>
        </div>

        <div class="lesson-content-area">
          <div class="lesson-notes">
            <div class="notes-content" v-html="localizedLessonNotes"></div>
          </div>

          <div class="lesson-detail-actions">
            <button
              v-if="isTheoryView"
              class="action-btn completed"
              disabled>
              🔓 {{ t('unlockByCompletingInicioLevels') }}
            </button>

            <template v-else>
            <button 
              v-if="!selectedLesson.completed"
              class="action-btn"
              :disabled="!isCurrentLessonUnlocked()"
              @click="markLessonComplete()">
              <span v-if="!isCurrentLessonUnlocked()">🔒 {{ t('unlockPreviousLevels') }}</span>
              <span v-else>✅ {{ t('markAsCompleted') }}</span>
            </button>
            <button 
              v-else
              class="action-btn completed"
              disabled>
              ✓ {{ t('completed') }}
            </button>
            </template>
          </div>
        </div>
      </template>
    </div>
    <nav class="bottom-nav">
      <button 
        class="nav-item" 
        :class="{ active: activeSection === 'inicio' }"
        @click="$emit('change-section', 'inicio')" 
        :title="t('home')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </button>

      <button 
        class="nav-item" 
        :class="{ active: activeSection === 'comunidad' }"
        @click="$emit('change-section', 'comunidad')" 
        :title="t('community')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      </button>

      <button 
        class="nav-item" 
        :class="{ active: activeSection === 'clasificacion' }"
        @click="$emit('change-section', 'clasificacion')" 
        :title="t('ranking')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 3H8v2H5v3c0 2.97 2.16 5.43 5 5.91V17H7v2h10v-2h-3v-3.09c2.84-.48 5-2.94 5-5.91V5h-3V3zm-9 5V7h1v4.82C7.16 11.4 7 9.54 7 8zm10 0c0 1.54-.16 3.4-1 3.82V7h1v1z"/>
        </svg>
      </button>

      <button 
        class="nav-item" 
        :class="{ active: activeSection === 'lecciones' }"
        @click="$emit('change-section', 'lecciones')" 
        :title="t('lessons')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 4.5C5 3.67 5.67 3 6.5 3H18v14H7c-.55 0-1 .45-1 1s.45 1 1 1h11v2H7c-1.66 0-3-1.34-3-3V4.5z"/>
          <path d="M14.06 8.19l1.75 1.75-4.93 4.94H9.13v-1.75l4.93-4.94zm2.47-.72l.94-.94a1 1 0 011.41 0l.59.59a1 1 0 010 1.41l-.94.94-2-2z"/>
        </svg>
      </button>

      <button 
        class="nav-item" 
        :class="{ active: activeSection === 'perfil', 'has-alert': pendingRequestsCount > 0 }"
        @click="$emit('change-section', 'perfil')" 
        :title="t('profile')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <span v-if="pendingRequestsCount > 0" class="menu-alert-badge">{{ pendingRequestsCount > 9 ? '9+' : pendingRequestsCount }}</span>
      </button>
    </nav>
  </div>
</template>

<script>
import { API_BASE_URL } from '../config/api'

export default {
  name: 'Lecciones',
  props: {
    activeSection: {
      type: String,
      default: 'lecciones'
    },
    user: {
      type: Object,
      default: null
    },
    pendingRequestsCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      uiLanguage: 'es',
      selectedCourseId: '',
      selectedLessonId: '',
      selectedTheoryLesson: null,
      expandedLanguages: {},
      languageTheoryState: {},
      fallbackLearningPath: {
        preferredTrack: 'Front-end',
        recommendedCourse: 'frontend',
        activeCourse: 'frontend',
        startedCourses: ['frontend'],
        startedLessons: ['frontend-html'],
        completedLessons: []
      },
      courseCatalog: [
        {
          id: 'python',
          title: 'Desarrollador de Python',
          description: 'Aprende lógica, sintaxis y programación orientada a objetos con Python.',
          techs: ['Python'],
          manuals: [
            { title: 'Manual de Python Completo', summary: 'Sintaxis, POO, librerías y desarrollo de aplicaciones.' }
          ],
          lessons: [
            { id: 'python', title: 'Python', notes: '<h4>¿Qué es Python?</h4><p>Python es un lenguaje de programación versátil, fácil de aprender y poderoso. Ideal para principiantes y profesionales.</p><h4>Instalación:</h4><p>Descarga Python desde <strong>python.org</strong> e instala el intérprete.</p><h4>Tu primer programa:</h4><pre>print("Hola Python")</pre><h4>Temas cubiertos:</h4><ul><li><strong>Variables y tipos de datos:</strong> int, float, str, bool</li><li><strong>Estructuras de control:</strong> if, elif, else, for, while</li><li><strong>Funciones:</strong> Definición, parámetros, retorno</li><li><strong>Estructuras de datos:</strong> Listas, tuplas, diccionarios, conjuntos</li><li><strong>POO:</strong> Clases, objetos, herencia, polimorfismo</li><li><strong>Módulos y librerías:</strong> math, random, datetime, requests</li><li><strong>Manejo de archivos:</strong> Lectura y escritura</li><li><strong>Excepciones:</strong> try, except, finally</li></ul><h4>Características principales:</h4><ul><li>Sintaxis clara y legible</li><li>Tipado dinámico</li><li>Gran comunidad y librerías</li><li>Versátil: web, data science, automatización</li></ul>' }
          ]
        },
        {
          id: 'frontend',
          title: 'Desarrollador Front-End',
          description: 'Domina HTML, CSS, JavaScript y crea interfaces modernas responsivas.',
          techs: ['HTML', 'CSS', 'JavaScript', 'Vue'],
          manuals: [
            { title: 'Manual de HTML + CSS', summary: 'Estructura semántica, diseño responsivo, Flexbox y Grid.' },
            { title: 'Manual de JavaScript moderno', summary: 'DOM, eventos, async/await, módulos y librerías.' }
          ],
          lessons: [
            { id: 'frontend-html', title: 'Fundamentos de HTML', notes: '<h4>¿Qué es HTML?</h4><p>HTML (HyperText Markup Language) es el lenguaje estándar para crear páginas web. Usa etiquetas para estructurar el contenido.</p><h4>Etiquetas básicas:</h4><ul><li>&lt;html&gt; - Contenedor principal</li><li>&lt;head&gt; - Metadatos y estilos</li><li>&lt;body&gt; - Contenido visible</li><li>&lt;h1&gt; a &lt;h6&gt; - Títulos</li><li>&lt;p&gt; - Párrafos</li><li>&lt;a&gt; - Enlaces</li></ul>' },
            { id: 'frontend-css', title: 'Estilos con CSS', notes: '<h4>¿Qué es CSS?</h4><p>CSS (Cascading Style Sheets) es el lenguaje para darle estilos a las páginas HTML.</p><h4>Selectores comunes:</h4><ul><li>.clase - Selecciona por clase</li><li>#id - Selecciona por ID</li><li>elemento - Selecciona etiquetas</li></ul><h4>Propiedades:</h4><ul><li>color - Color del texto</li><li>background-color - Color de fondo</li><li>font-size - Tamaño de letra</li><li>margin, padding - Espaciado</li></ul>' },
            { id: 'frontend-js', title: 'JavaScript básico', notes: '<h4>¿Qué es JavaScript?</h4><p>JavaScript es un lenguaje de programación que te permite añadir interactividad a las páginas web.</p><h4>Variables:</h4><pre>let nombre = "Juan";\nconst edad = 25;</pre><h4>Funciones:</h4><pre>function saludar() {\n  console.log("Hola mundo");\n}</pre>' },
            { id: 'frontend-layout', title: 'Layouts responsivos', notes: '<h4>Diseño Responsivo</h4><p>Crear sitios que se adapten a diferentes tamaños de pantalla.</p><h4>Técnicas:</h4><ul><li><strong>Flexbox:</strong> display: flex; - Para layouts flexibles</li><li><strong>Grid:</strong> display: grid; - Para layouts de dos dimensiones</li><li><strong>Media Queries:</strong> @media - Para estilos adaptables</li></ul><h4>Breakpoints comunes:</h4><ul><li>Mobile: 0-768px</li><li>Tablet: 768px-1024px</li><li>Desktop: 1024px+</li></ul>' }
          ]
        },
        {
          id: 'backend',
          title: 'Desarrollador Back-End',
          description: 'Construye la lógica del servidor, APIs y autenticación con PHP, Python, Java y MySQL.',
          techs: ['PHP', 'Python', 'Java', 'MySQL'],
          manuals: [
            { title: 'Manual completo de Java', summary: 'POO, colecciones, clases, interfaces y patrones básicos.' },
            { title: 'Manual de APIs Back-End', summary: 'REST, validación, manejo de errores y seguridad.' }
          ],
          lessons: [
            { id: 'backend-java', title: 'Fundamentos de Java', notes: '<h4>¿Qué es Java?</h4><p>Java es un lenguaje compilado, orientado a objetos, versátil y poderoso para crear servidores y aplicaciones empresariales.</p><h4>Setup:</h4><pre>public class MiPrimera Aplicacion {\n  public static void main(String[] args) {\n    System.out.println("Hola Java");\n  }\n}</pre><h4>Tipos de datos:</h4><ul><li>int - Números enteros</li><li>double - Números decimales</li><li>String - Texto</li><li>boolean - Booleanos</li></ul>' },
            { id: 'backend-poo', title: 'POO aplicada al back-end', notes: '<h4>Programación Orientada a Objetos</h4><p>Paradigma que organiza el código en objetos y clases.</p><h4>Conceptos clave:</h4><ul><li><strong>Clases:</strong> Plantillas para objetos</li><li><strong>Objetos:</strong> Instancias de clases</li><li><strong>Herencia:</strong> Relación entre clases</li><li><strong>Polimorfismo:</strong> Múltiples formas</li><li><strong>Encapsulación:</strong> Ocultar datos</li></ul><h4>Ejemplo:</h4><pre>class Usuario {\n  private String nombre;\n  public void setNombre(String n) {\n    nombre = n;\n  }\n}</pre>' },
            { id: 'backend-api', title: 'Construcción de API REST', notes: '<h4>API REST</h4><p>Interfaz para comunicación entre cliente y servidor usando HTTP.</p><h4>Métodos HTTP:</h4><ul><li><strong>GET:</strong> Obtener datos</li><li><strong>POST:</strong> Crear datos</li><li><strong>PUT:</strong> Actualizar datos</li><li><strong>DELETE:</strong> Eliminar datos</li></ul><h4>Endpoint ejemplo:</h4><pre>GET /api/usuarios/:id\nPOST /api/usuarios</pre><h4>Respuesta JSON:</h4><pre>{\n  "id": 1,\n  "nombre": "Juan",\n  "email": "juan@example.com"\n}</pre>' }
          ]
        },
        {
          id: 'database',
          title: 'Especialista en Bases de Datos',
          description: 'Modela y consulta datos relacionales con MySQL y Python.',
          techs: ['MySQL', 'Python'],
          manuals: [
            { title: 'Manual completo de MySQL', summary: 'Diseño, consultas, relaciones y optimización.' },
            { title: 'Manual de Python para Datos', summary: 'Pandas, NumPy, análisis y visualización de datos.' }
          ],
          lessons: [
            { id: 'database-mysql', title: 'MySQL', notes: '<h4>MySQL - Sistema de Gestión de Bases de Datos Relacional</h4><p>Base de datos de código abierto, rápida y confiable para aplicaciones web.</p><h4>Instalación:</h4><p>Descarga desde <strong>mysql.com</strong> o usa un gestor como XAMPP.</p><h4>Conexión:</h4><pre>mysql -u root -p</pre><h4>Comandos básicos:</h4><pre>CREATE DATABASE miapp;\nUSE miapp;\nCREATE TABLE usuarios (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  nombre VARCHAR(100),\n  email VARCHAR(100)\n);</pre><h4>CRUD - Create, Read, Update, Delete:</h4><ul><li><strong>INSERT</strong> - Insertar datos</li><li><strong>SELECT</strong> - Consultar datos</li><li><strong>UPDATE</strong> - Actualizar datos</li><li><strong>DELETE</strong> - Eliminar datos</li></ul><h4>Operadores y funciones:</h4><ul><li><strong>WHERE</strong> - Filtrar registros</li><li><strong>ORDER BY</strong> - Ordenar resultados</li><li><strong>GROUP BY</strong> - Agrupar datos</li><li><strong>JOIN</strong> - INNER, LEFT, RIGHT, FULL</li><li><strong>Funciones:</strong> COUNT, SUM, AVG, MIN, MAX</li></ul><h4>Relaciones:</h4><ul><li><strong>PRIMARY KEY</strong> - Clave primaria</li><li><strong>FOREIGN KEY</strong> - Clave foránea (relaciones)</li></ul><h4>Modelado relacional:</h4><ul><li>Identificar entidades</li><li>Definir atributos</li><li>Establecer relaciones (1:1, 1:N, N:M)</li><li>Normalizar datos</li></ul><h4>Mejores prácticas:</h4><ul><li>Crear índices en columnas buscadas</li><li>Normalizar datos (Formas Normales)</li><li>Evitar SELECT *</li><li>Usar EXPLAIN para analizar consultas</li></ul>' },
            { id: 'database-python', title: 'Python para Datos', notes: '<h4>Python para Análisis de Datos</h4><p>Python es el lenguaje preferido para análisis de datos, ciencia de datos y machine learning.</p><h4>Instalación:</h4><p>Descarga Python desde <strong>python.org</strong>.</p><h4>Librerías esenciales:</h4><ul><li><strong>Pandas:</strong> Manipulación de datos</li><li><strong>NumPy:</strong> Operaciones numéricas</li><li><strong>Matplotlib:</strong> Visualización</li><li><strong>Scikit-learn:</strong> Machine Learning</li></ul><h4>Conexión a bases de datos:</h4><pre>import mysql.connector\nconexion = mysql.connector.connect(\n  host="localhost",\n  user="root",\n  password="",\n  database="miapp"\n)\ncursor = conexion.cursor()\ncursor.execute("SELECT * FROM usuarios")\nresultados = cursor.fetchall()</pre><h4>Consultas con Pandas:</h4><pre>import pandas as pd\ndf = pd.read_csv("datos.csv")\ndf.head()\ndf.info()\ndf.describe()</pre><h4>Análisis básicos:</h4><ul><li><strong>Agrupación:</strong> df.groupby()</li><li><strong>Filtrado:</strong> df[df["edad"] > 25]</li><li><strong>Estadísticas:</strong> mean(), sum(), count()</li><li><strong>Visualización:</strong> df.plot()</li></ul><h4>Mejores prácticas:</h4><ul><li>Limpiar datos antes de analizar</li><li>Validar tipos de datos</li><li>Documentar tu análisis</li><li>Usar versionado para experimentos</li></ul>' }
          ]
        },
        {
          id: 'fullstack',
          title: 'Desarrollador Full-Stack',
          description: 'Domina todos los lenguajes: Frontend, Backend y BD para crear aplicaciones completas.',
          techs: ['HTML', 'CSS', 'JavaScript', 'Vue', 'Java', 'MySQL', 'APIs REST'],
          manuals: [
            { title: 'Manual de arquitectura Full-Stack', summary: 'Cómo conectar frontend, backend y base de datos.' }
          ],
          lessons: [
            { id: 'fullstack-html', title: 'HTML', notes: '<h4>HTML - HyperText Markup Language</h4><p>Lenguaje estándar para crear la estructura de páginas web.</p><h4>Instalación:</h4><p>No requiere instalación. Solo necesitas un editor de texto (VS Code, Sublime Text, etc.) y un navegador.</p><h4>Estructura básica:</h4><pre>&lt;!DOCTYPE html&gt;\n&lt;html lang="es"&gt;\n&lt;head&gt;\n  &lt;title&gt;Mi Primera Página&lt;/title&gt;\n&lt;/head&gt;\n&lt;body&gt;\n  &lt;h1&gt;Hola Mundo&lt;/h1&gt;\n  &lt;p&gt;Bienvenido a HTML&lt;/p&gt;\n&lt;/body&gt;\n&lt;/html&gt;</pre><h4>Etiquetas principales:</h4><ul><li><strong>&lt;h1&gt; a &lt;h6&gt;</strong> - Títulos</li><li><strong>&lt;p&gt;</strong> - Párrafos</li><li><strong>&lt;a&gt;</strong> - Enlaces</li><li><strong>&lt;img&gt;</strong> - Imágenes</li><li><strong>&lt;form&gt;</strong> - Formularios</li><li><strong>&lt;div&gt;</strong> - Contenedores</li><li><strong>&lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;</strong> - Listas</li></ul><h4>Semántica HTML5:</h4><ul><li>&lt;header&gt; - Encabezado</li><li>&lt;nav&gt; - Navegación</li><li>&lt;main&gt; - Contenido principal</li><li>&lt;footer&gt; - Pie de página</li></ul>' },
            { id: 'fullstack-css', title: 'CSS', notes: '<h4>CSS - Cascading Style Sheets</h4><p>Lenguaje para diseñar y darle estilos a las páginas HTML.</p><h4>Sintaxis básica:</h4><pre>selector {\n  propiedad: valor;\n}\n\n.clase {\n  background-color: blue;\n  color: white;\n}</pre><h4>Selectores:</h4><ul><li><strong>.clase</strong> - Selecciona por clase</li><li><strong>#id</strong> - Selecciona por ID</li><li><strong>elemento</strong> - Selecciona etiquetas</li><li><strong>elemento.clase</strong> - Combinaciones</li></ul><h4>Propiedades comunes:</h4><ul><li><strong>color</strong> - Color del texto</li><li><strong>background-color</strong> - Color de fondo</li><li><strong>font-size</strong> - Tamaño de letra</li><li><strong>margin, padding</strong> - Espaciado</li><li><strong>border</strong> - Bordes</li><li><strong>width, height</strong> - Dimensiones</li></ul><h4>Layout moderno:</h4><ul><li><strong>Flexbox:</strong> display: flex</li><li><strong>Grid:</strong> display: grid</li><li><strong>Media Queries:</strong> @media (max-width: 768px)</li></ul>' },
            { id: 'fullstack-js', title: 'JavaScript', notes: '<h4>JavaScript - Lenguaje de Programación Web</h4><p>Lenguaje de programación que añade interactividad a las páginas web.</p><h4>Variables y tipos:</h4><pre>let nombre = "Juan";\nconst edad = 25;\nvar ciudad = "Madrid";\n\nlet numero = 42;\nlet decimal = 3.14;\nlet booleano = true;</pre><h4>Funciones:</h4><pre>function saludar(nombre) {\n  return `Hola ${nombre}`;\n}\n\nconst sumar = (a, b) => a + b;</pre><h4>Estructuras de control:</h4><ul><li><strong>if/else</strong> - Condicionales</li><li><strong>for/while</strong> - Bucles</li><li><strong>switch</strong> - Casos múltiples</li></ul><h4>Arrays y Objetos:</h4><pre>let numeros = [1, 2, 3];\nlet persona = { nombre: "Juan", edad: 25 };</pre><h4>DOM y Eventos:</h4><ul><li><strong>document.getElementById()</strong> - Seleccionar elementos</li><li><strong>addEventListener()</strong> - Escuchar eventos</li><li><strong>element.innerHTML</strong> - Cambiar contenido</li></ul><h4>Async/Await (Promesas):</h4><pre>async function obtenerDatos() {\n  const respuesta = await fetch("/api/data");\n  return await respuesta.json();\n}</pre>' },
            { id: 'fullstack-vue', title: 'Vue', notes: '<h4>Vue.js - Framework Progresivo</h4><p>Framework JavaScript para construir interfaces de usuario interactivas y dinámicas.</p><h4>Instalación:</h4><p>Descarga desde <strong>vuejs.org</strong> o usa npm: <strong>npm install vue</strong></p><h4>Estructura básica:</h4><pre>&lt;div id="app"&gt;\n  &lt;p&gt;{{ mensaje }}&lt;/p&gt;\n&lt;/div&gt;\n\nconst app = new Vue({\n  el: "#app",\n  data() {\n    return { mensaje: "Hola Vue" }\n  }\n})</pre><h4>Conceptos clave:</h4><ul><li><strong>{{ }}</strong> - Interpolación de datos</li><li><strong>v-bind</strong> - Vincular atributos</li><li><strong>v-if, v-show</strong> - Condicionales</li><li><strong>v-for</strong> - Iteraciones</li><li><strong>v-on o @</strong> - Eventos</li><li><strong>v-model</strong> - Two-way binding</li></ul><h4>Componentes:</h4><pre>Vue.component("header", {\n  template: "&lt;h1&gt;Mi Componente&lt;/h1&gt;"\n});</pre><h4>Características:</h4><ul><li>Componentes reutilizables</li><li>Reactividad automática</li><li>Sintaxis simple y clara</li><li>Transiciones y animaciones</li></ul>' },
            { id: 'fullstack-java', title: 'Java', notes: '<h4>Java - Lenguaje Compilado Orientado a Objetos</h4><p>Potente y versátil para crear aplicaciones empresariales y servidores.</p><h4>Instalación:</h4><p>Descarga JDK desde <strong>oracle.com</strong>.</p><h4>Estructura básica:</h4><pre>public class MiPrimeraAplicacion {\n  public static void main(String[] args) {\n    System.out.println("¡Hola Java!");\n  }\n}</pre><h4>Conceptos fundamentales:</h4><ul><li><strong>Variables y tipos:</strong> int, double, String, boolean</li><li><strong>Control de flujo:</strong> if, else, switch, for, while</li><li><strong>Arrays y Colecciones:</strong> Array[], ArrayList, HashMap</li><li><strong>Métodos:</strong> Definición, parámetros, retorno</li><li><strong>POO - Clases y Objetos:</strong> Atributos, constructores, métodos</li><li><strong>Herencia:</strong> extends</li><li><strong>Polimorfismo:</strong> Interfaces y clases abstractas</li></ul><h4>Frameworks populares:</h4><ul><li><strong>Spring Boot</strong> - Para APIs REST</li><li><strong>Hibernate</strong> - ORM para bases de datos</li><li><strong>Maven/Gradle</strong> - Gestores de proyectos</li></ul>' },
            { id: 'fullstack-api', title: 'APIs REST', notes: '<h4>APIs REST - Arquitectura de Servicios Web</h4><p>Interfaz para comunicación entre cliente y servidor usando HTTP. REST es un estilo arquitectónico para crear APIs escalables y eficientes.</p><h4>¿Qué es REST?</h4><p><strong>REST</strong> (Representational State Transfer) es un conjunto de principios para diseñar servicios web.</p><h4>Métodos HTTP:</h4><ul><li><strong>GET</strong> - Obtener datos (seguro, sin efectos secundarios)</li><li><strong>POST</strong> - Crear nuevos datos</li><li><strong>PUT</strong> - Actualizar datos completos</li><li><strong>PATCH</strong> - Actualizar parcialmente</li><li><strong>DELETE</strong> - Eliminar datos</li></ul><h4>Estructura de endpoints:</h4><pre>GET /api/usuarios - Listar todos\nGET /api/usuarios/:id - Obtener uno\nPOST /api/usuarios - Crear\nPUT /api/usuarios/:id - Actualizar\nDELETE /api/usuarios/:id - Eliminar</pre><h4>Respuestas HTTP:</h4><ul><li><strong>200 OK</strong> - Éxito</li><li><strong>201 Created</strong> - Creado exitosamente</li><li><strong>400 Bad Request</strong> - Solicitud inválida</li><li><strong>401 Unauthorized</strong> - No autorizado</li><li><strong>404 Not Found</strong> - No encontrado</li><li><strong>500 Server Error</strong> - Error del servidor</li></ul><h4>Formato JSON:</h4><pre>{\n  "id": 1,\n  "nombre": "Juan",\n  "email": "juan@example.com",\n  "activo": true\n}</pre><h4>Herramientas:</h4><ul><li><strong>Postman</strong> - Probar APIs</li><li><strong>Insomnia</strong> - Cliente REST</li><li><strong>cURL</strong> - Herramienta de línea de comandos</li></ul>' },
            { id: 'fullstack-mysql', title: 'MySQL', notes: '<h4>MySQL - Sistema de Gestión de Bases de Datos Relacional</h4><p>Base de datos de código abierto, rápida y confiable para aplicaciones web.</p><h4>Instalación:</h4><p>Descarga desde <strong>mysql.com</strong> o usa un gestor como XAMPP.</p><h4>Conexión:</h4><pre>mysql -u root -p</pre><h4>Comandos básicos:</h4><pre>CREATE DATABASE miapp;\nUSE miapp;\nCREATE TABLE usuarios (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  nombre VARCHAR(100),\n  email VARCHAR(100)\n);</pre><h4>CRUD - Create, Read, Update, Delete:</h4><ul><li><strong>INSERT</strong> - Insertar datos</li><li><strong>SELECT</strong> - Consultar datos</li><li><strong>UPDATE</strong> - Actualizar datos</li><li><strong>DELETE</strong> - Eliminar datos</li></ul><h4>Relaciones:</h4><ul><li><strong>PRIMARY KEY</strong> - Clave primaria</li><li><strong>FOREIGN KEY</strong> - Clave foránea (relaciones)</li><li><strong>JOINs</strong> - INNER, LEFT, RIGHT, FULL</li></ul>' }
          ]
        }
      ]
    }
  },
  computed: {
    learningPath() {
      return this.user?.learningPath || this.fallbackLearningPath
    },
    coursesWithState() {
      const startedCourses = new Set(this.learningPath.startedCourses || [])
      const startedLessons = new Set(this.learningPath.startedLessons || [])
      const completedLessons = new Set(this.learningPath.completedLessons || [])

      // Mapeo de lecciones: si completaste una, también cuentan sus variantes en otros cursos
      const LESSON_VARIANTS_MAP = {
        'frontend-html': ['frontend-html', 'fullstack-html'],
        'fullstack-html': ['frontend-html', 'fullstack-html'],
        'frontend-css': ['frontend-css', 'fullstack-css'],
        'fullstack-css': ['frontend-css', 'fullstack-css'],
        'frontend-js': ['frontend-js', 'fullstack-js'],
        'fullstack-js': ['frontend-js', 'fullstack-js'],
        'backend-api': ['backend-api', 'fullstack-api'],
        'fullstack-api': ['backend-api', 'fullstack-api'],
        'database-mysql': ['database-mysql', 'fullstack-mysql'],
        'fullstack-mysql': ['database-mysql', 'fullstack-mysql'],
        'database-python': ['database-python'],
        'backend-java': ['backend-java', 'fullstack-java'],
        'fullstack-java': ['backend-java', 'fullstack-java'],
        'python': ['python'],
        'fullstack-vue': ['fullstack-vue']
      };

      // Crear un Set de todas las lecciones que deberían estar completadas
      const allCompletedLessons = new Set();
      completedLessons.forEach((lessonId) => {
        // Si esta lección tiene variantes, agregar todas
        const variants = LESSON_VARIANTS_MAP[lessonId];
        if (variants) {
          variants.forEach(v => allCompletedLessons.add(v));
        } else {
          // Si no tiene variantes, solo agregar la lección en sí
          allCompletedLessons.add(lessonId);
        }
      });

      return this.courseCatalog.map((course) => ({
        ...course,
        started: startedCourses.has(course.id),
        lessons: course.lessons.map((lesson) => ({
          ...lesson,
          started: startedLessons.has(lesson.id),
          completed: allCompletedLessons.has(lesson.id)
        }))
      }))
    },
    selectedCourse() {
      return this.coursesWithState.find((course) => course.id === this.selectedCourseId) || null
    },
    selectedLesson() {
      if (this.selectedTheoryLesson) {
        return this.selectedTheoryLesson
      }

      if (!this.selectedCourse) return null
      const lesson = this.selectedCourse.lessons.find((lesson) => lesson.id === this.selectedLessonId) || null
      if (!lesson) return null

      return {
        ...lesson,
        notes: this.enhanceLegacyLessonNotes(lesson)
      }
    },
    isTheoryView() {
      return Boolean(this.selectedTheoryLesson)
    },
    localizedLessonNotes() {
      const rawNotes = String(this.selectedLesson?.notes || '')
      if (!rawNotes) return rawNotes
      if (this.uiLanguage !== 'en') return rawNotes
      return this.localizeLessonHtml(rawNotes)
    }
  },
  methods: {
    t(key) {
      const dictionary = {
        es: {
          professionalDevelopment: 'Desarrollo profesional',
          lessonsUpper: 'LECCIONES',
          back: 'Volver',
          level: 'Nivel',
          noCurriculumForLanguage: 'No hay temario disponible para este lenguaje en este curso.',
          unlockByCompletingInicioLevels: 'Se desbloquea al completar niveles en Inicio',
          unlockPreviousLevels: 'Desbloquea niveles anteriores',
          markAsCompleted: 'Marcar como Completado',
          completed: 'Completado',
          home: 'Inicio',
          community: 'Comunidad',
          ranking: 'Clasificación',
          lessons: 'Lecciones',
          profile: 'Perfil'
        },
        en: {
          professionalDevelopment: 'Professional development',
          lessonsUpper: 'LESSONS',
          back: 'Back',
          level: 'Level',
          noCurriculumForLanguage: 'No curriculum available for this language in this course.',
          unlockByCompletingInicioLevels: 'Unlocks after completing levels in Home',
          unlockPreviousLevels: 'Unlock previous levels',
          markAsCompleted: 'Mark as Completed',
          completed: 'Completed',
          home: 'Home',
          community: 'Community',
          ranking: 'Ranking',
          lessons: 'Lessons',
          profile: 'Profile'
        }
      }

      const langPack = dictionary[this.uiLanguage] || dictionary.es
      return langPack[key] || key
    },
    getLocalizedText(text) {
      const source = String(text || '')
      if (this.uiLanguage !== 'en' || !source) return source

      return this.translateSpanishToEnglish(source)
    },
    translateSpanishToEnglish(text) {
      const source = String(text || '')
      if (!source) return source

      const replacements = [
        [/\bDesarrollo profesional\b/gi, 'Professional development'],
        [/\bDesarrollador Front-End\b/gi, 'Front-End Developer'],
        [/\bDesarrollador Back-End\b/gi, 'Back-End Developer'],
        [/\bDesarrollador Full-Stack\b/gi, 'Full-Stack Developer'],
        [/\bDesarrollador de Python\b/gi, 'Python Developer'],
        [/\bEspecialista en Bases de Datos\b/gi, 'Database Specialist'],
        [/\bFundamentos de\b/gi, 'Fundamentals of'],
        [/\bEstilos con\b/gi, 'Styling with'],
        [/\bConstrucción de\b/gi, 'Building'],
        [/\bConstruccion de\b/gi, 'Building'],
        [/\bProgramación Orientada a Objetos\b/gi, 'Object-Oriented Programming'],
        [/\bProgramacion Orientada a Objetos\b/gi, 'Object-Oriented Programming'],
        [/\blección\b/gi, 'lesson'],
        [/\blecciones\b/gi, 'lessons'],
        [/\bnivel\b/gi, 'level'],
        [/\bNiveles\b/g, 'Levels'],
        [/\bDesarrollador\b/gi, 'Developer'],
        [/\bDesarrollo\b/gi, 'Development'],
        [/\bAprende\b/gi, 'Learn'],
        [/\bDomina\b/gi, 'Master'],
        [/\bLenguaje\b/gi, 'Language'],
        [/\bLenguajes\b/gi, 'Languages'],
        [/\bBases de Datos\b/gi, 'Databases'],
        [/\bbásico\b/gi, 'basic'],
        [/\bbásica\b/gi, 'basic'],
        [/\bbasico\b/gi, 'basic'],
        [/\bbasica\b/gi, 'basic'],
        [/\bcompleto\b/gi, 'complete'],
        [/\bcompleta\b/gi, 'complete']
      ]

      let localized = source
      replacements.forEach(([pattern, value]) => {
        localized = localized.replace(pattern, value)
      })
      return localized
    },
    localizeLessonHtml(html) {
      const source = String(html || '')
      if (!source) return source

      // Preserve code snippets from accidental translation.
      const protectedBlocks = []
      let working = source.replace(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, (match) => {
        const token = `__CODE_BLOCK_${protectedBlocks.length}__`
        protectedBlocks.push(match)
        return token
      })

      working = this.translateSpanishToEnglish(working)
        .replace(/\bQué es\b/gi, 'What is')
        .replace(/\bInstalación\b/gi, 'Installation')
        .replace(/\bTemas cubiertos\b/gi, 'Topics covered')
        .replace(/\bCaracterísticas principales\b/gi, 'Key features')
        .replace(/\bComandos básicos\b/gi, 'Basic commands')
        .replace(/\bMejores prácticas\b/gi, 'Best practices')
        .replace(/\bConexión\b/gi, 'Connection')
        .replace(/\bEstructura básica\b/gi, 'Basic structure')
        .replace(/\bPropiedades\b/gi, 'Properties')
        .replace(/\bSelectores\b/gi, 'Selectors')
        .replace(/\bFunciones\b/gi, 'Functions')
        .replace(/\bVariables\b/gi, 'Variables')
        .replace(/\bEjemplo\b/gi, 'Example')
        .replace(/\bObjetivo del nivel\b/gi, 'Level objective')
        .replace(/\bCómo estudiar este nivel\b/gi, 'How to study this level')
        .replace(/\bPuntos clave\b/gi, 'Key points')
        .replace(/\bError frecuente\b/gi, 'Common mistake')
        .replace(/\bChecklist\b/gi, 'Checklist')
        .replace(/\bReferencia recomendada\b/gi, 'Recommended reference')

      return working.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => protectedBlocks[Number(index)] || '')
    },
    refreshUiLanguageFromStorage() {
      try {
        const stored = localStorage.getItem('inicio-ui-language')
        this.uiLanguage = stored === 'en' ? 'en' : 'es'
      } catch (error) {
        this.uiLanguage = 'es'
      }

      this.reloadExpandedTheorySections()
    },
    handleStorageUpdate(event) {
      if (!event || event.key === 'inicio-ui-language') {
        this.refreshUiLanguageFromStorage()
      }
    },
    reloadExpandedTheorySections() {
      const expanded = Object.entries(this.expandedLanguages || {})
        .filter(([, isExpanded]) => Boolean(isExpanded))
        .map(([language]) => language)

      expanded.forEach((language) => {
        this.ensureLanguageTheory(language)
      })
    },
    async selectCourse(courseId) {
      this.selectedCourseId = courseId
      this.selectedLessonId = ''
      this.selectedTheoryLesson = null
      this.expandedLanguages = {}
      // Iniciar el curso automáticamente
      const nextPath = { ...this.learningPath }
      if (!nextPath.startedCourses) nextPath.startedCourses = []
      if (!nextPath.startedCourses.includes(courseId)) {
        nextPath.startedCourses.push(courseId)
        this.persistLearningPath(nextPath)
      }

      const course = this.courseCatalog.find((item) => item.id === courseId)
      if (course?.techs?.length === 1) {
        const singleLanguage = course.techs[0]
        this.expandedLanguages = {
          ...this.expandedLanguages,
          [singleLanguage]: true
        }
        await this.ensureLanguageTheory(singleLanguage)
      }
    },
    completedLessons(course) {
      return course.lessons.filter((lesson) => lesson.completed).length
    },
    getCourseProgress(course) {
      if (!course.lessons.length) return 0
      return Math.round((this.completedLessons(course) / course.lessons.length) * 100)
    },
    normalizeTechToLanguage(language) {
      const map = {
        'APIs REST': 'Node.js',
        'APIs': 'Node.js'
      }

      return map[language] || language
    },
    getTheoryState(language) {
      const key = this.normalizeTechToLanguage(language)
      const languageScopedKey = `${key}::${this.uiLanguage}`
      return this.languageTheoryState[languageScopedKey] || null
    },
    getTheoryLevelsByLanguage(language) {
      const state = this.getTheoryState(language)
      if (!state?.levels) return []

      return state.levels.map((level) => ({
        ...level,
        completed: level.id <= state.completedCount
      }))
    },
    getVisibleLevelsByLanguage(language) {
      const dynamicLevels = this.getTheoryLevelsByLanguage(language)
      if (dynamicLevels.length > 0) {
        return dynamicLevels
      }

      if (!this.selectedCourse) {
        return []
      }

      const normalizedLanguage = this.normalizeTechToLanguage(language)
      const normalizedSlug = String(normalizedLanguage || '').toLowerCase()

      const fallbackLessons = (this.selectedCourse.lessons || []).filter((lesson) => {
        const lessonId = String(lesson?.id || '').toLowerCase()
        const lessonTitle = String(lesson?.title || '').toLowerCase()
        return lessonId.includes(normalizedSlug) || lessonTitle.includes(normalizedSlug)
      })

      return fallbackLessons.map((lesson, index) => ({
        id: index + 1,
        name: lesson.title || `Nivel ${index + 1}`,
        description: lesson.title || '',
        content: { theory: [] },
        completed: false,
        fallbackNotesHtml: lesson.notes || ''
      }))
    },
    isTheoryLevelUnlocked(language, levelId) {
      const state = this.getTheoryState(language)
      if (!state) return true
      return levelId <= (state.completedCount + 1)
    },
    getTheoryLevelClass(language, level) {
      if (level.completed) return 'completed'
      if (this.isTheoryLevelUnlocked(language, level.id)) return 'unlocked'
      return 'locked'
    },
    getDisplayLevelName(level) {
      const rawName = String(level?.name || `Nivel ${level?.id || ''}`)
      const cleanedName = rawName.replace(/\s*\(Práctica\s*\d*\)\s*/gi, '').trim()
      return this.getLocalizedText(cleanedName.replace(/\s·\sN\d+(?:\s·\sV\d+)?$/i, '').trim())
    },
    getW3SchoolsLanguageUrl(language) {
      const normalized = String(this.normalizeTechToLanguage(language) || '').toLowerCase()
      const urls = {
        html: 'https://www.w3schools.com/html/default.asp',
        css: 'https://www.w3schools.com/css/default.asp',
        javascript: 'https://www.w3schools.com/js/default.asp',
        'node.js': 'https://www.w3schools.com/nodejs/default.asp',
        node: 'https://www.w3schools.com/nodejs/default.asp',
        sql: 'https://www.w3schools.com/sql/default.asp',
        mysql: 'https://www.w3schools.com/sql/default.asp',
        python: 'https://www.w3schools.com/python/default.asp',
        java: 'https://www.w3schools.com/java/default.asp',
        php: 'https://www.w3schools.com/php/default.asp',
        vue: 'https://www.w3schools.com/vue/index.php'
      }

      return urls[normalized] || 'https://www.w3schools.com/'
    },
    getPedagogyHintByLanguage(language) {
      const normalized = String(this.normalizeTechToLanguage(language) || '').toLowerCase()
      const map = {
        html: 'Evita memorizar etiquetas sin entender para qué sirven en la estructura de la página.',
        css: 'Evita copiar estilos sin entender cascada, especificidad y responsive.',
        javascript: 'Evita practicar solo sintaxis: relaciona siempre con interacción real en la UI.',
        'node.js': 'Evita crear endpoints sin validar entradas y códigos de estado HTTP.',
        node: 'Evita crear endpoints sin validar entradas y códigos de estado HTTP.',
        sql: 'Evita ejecutar UPDATE/DELETE sin WHERE y valida primero con SELECT.',
        mysql: 'Evita ejecutar UPDATE/DELETE sin WHERE y valida primero con SELECT.',
        python: 'Evita saltar validaciones de entrada y control de errores en scripts.',
        java: 'Evita escribir clases sin diseño claro de responsabilidades.',
        php: 'Evita mostrar datos del usuario sin sanitización adecuada.'
      }

      return map[normalized] || 'Evita avanzar por inercia: verifica que entiendes el por qué de cada bloque.'
    },
    getLegacyLessonLanguage(lesson) {
      const lessonId = String(lesson?.id || '').toLowerCase()
      if (lessonId.includes('html')) return 'HTML'
      if (lessonId.includes('css')) return 'CSS'
      if (lessonId.includes('js') || lessonId.includes('javascript')) return 'JavaScript'
      if (lessonId.includes('vue')) return 'Vue'
      if (lessonId.includes('mysql') || lessonId.includes('sql')) return 'MySQL'
      if (lessonId.includes('python')) return 'Python'
      if (lessonId.includes('java')) return 'Java'
      if (lessonId.includes('php')) return 'PHP'

      const courseTech = Array.isArray(this.selectedCourse?.techs) ? this.selectedCourse.techs[0] : ''
      return courseTech || ''
    },
    enhanceLegacyLessonNotes(lesson) {
      const notes = String(lesson?.notes || '').trim()
      if (!notes) return notes
      if (notes.includes('data-learning-structure="v2"')) return notes

      const inferredLanguage = this.getLegacyLessonLanguage(lesson)
      const languageUrl = this.getW3SchoolsLanguageUrl(inferredLanguage)
      const hint = this.getPedagogyHintByLanguage(inferredLanguage)

      const pedagogyBlock = `
        <section data-learning-structure="v2">
          <h4>Ruta recomendada para estudiar esta lección</h4>
          <ol>
            <li><strong>Comprende:</strong> resume con tus palabras qué problema resuelve este tema.</li>
            <li><strong>Aplica:</strong> escribe una versión mínima funcional del ejemplo.</li>
            <li><strong>Valida:</strong> revisa sintaxis, salida esperada y legibilidad.</li>
          </ol>
          <p><strong>Error común a evitar:</strong> ${hint}</p>
          <p><strong>Próximo paso:</strong> cuando domines esta base, pasa al siguiente nivel práctico.</p>
          <p><strong>Referencia:</strong> <a href="${languageUrl}" target="_blank" rel="noopener noreferrer">Documentación recomendada (${inferredLanguage || 'Tutorial'})</a></p>
        </section>
      `

      return `${notes}${pedagogyBlock}`
    },
    buildTheoryNotes(level, language = '') {
      const theory = Array.isArray(level?.content?.theory) ? level.content.theory : []
      const theoryHtml = theory.length
        ? `<ul>${theory.map((line) => `<li>${line}</li>`).join('')}</ul>`
        : (this.uiLanguage === 'en' ? '<p>No theory available for this level.</p>' : '<p>Sin teoría disponible para este nivel.</p>')

      const quizItems = Array.isArray(level?.quiz) ? level.quiz : []
      const quizHtml = quizItems.length
        ? `<h4>${this.uiLanguage === 'en' ? 'Questions' : 'Preguntas'}</h4><ol>${quizItems.map((item) => {
            const question = this.getLocalizedText(String(item?.question || ''))
            const options = Array.isArray(item?.options) ? item.options : []
            const optionList = options.length
              ? `<ul>${options.map((option, index) => `<li>${String.fromCharCode(65 + index)}. ${this.getLocalizedText(String(option))}</li>`).join('')}</ul>`
              : ''

            return `<li><strong>${question}</strong>${optionList}</li>`
          }).join('')}</ol>`
        : ''

      const practice = level?.practice || {}
      const practiceTasks = Array.isArray(practice.tasks) ? practice.tasks : []
      const practiceHints = Array.isArray(practice.hints) ? practice.hints : []
      const fillBlanksHints = Array.isArray(practice.fillBlanksHints) ? practice.fillBlanksHints : []
      const goalLines = Array.isArray(practice.goalLines) ? practice.goalLines : []
      const practiceHtml = (practice.instruction || practiceTasks.length || practiceHints.length || fillBlanksHints.length || goalLines.length)
        ? `
          <h4>${this.uiLanguage === 'en' ? 'Practice' : 'Práctica'}</h4>
          ${practice.instruction ? `<p>${this.getLocalizedText(String(practice.instruction))}</p>` : ''}
          ${practiceTasks.length ? `<ol>${practiceTasks.map((task) => `<li>${this.getLocalizedText(String(task))}</li>`).join('')}</ol>` : ''}
          ${fillBlanksHints.length ? `<ul>${fillBlanksHints.map((hint) => `<li>${this.getLocalizedText(String(hint))}</li>`).join('')}</ul>` : ''}
          ${practiceHints.length ? `<p><strong>${this.uiLanguage === 'en' ? 'Hints' : 'Pistas'}:</strong></p><ul>${practiceHints.map((hint) => `<li>${this.getLocalizedText(String(hint))}</li>`).join('')}</ul>` : ''}
          ${goalLines.length ? `<p><strong>${this.uiLanguage === 'en' ? 'Expected result' : 'Resultado esperado'}:</strong></p><pre>${goalLines.map((line) => String(line)).join('\n')}</pre>` : ''}
        `
        : ''

      const currentLanguage = language || this.selectedTheoryLesson?.language || this.selectedLesson?.language || ''
      const languageUrl = this.getW3SchoolsLanguageUrl(currentLanguage)
      const levelObjective = String(level?.description || 'Entender los conceptos esenciales y aplicarlos con un ejemplo práctico.')
      const phaseHint = this.getPedagogyHintByLanguage(currentLanguage)

      const example = level?.content?.example
        ? `<h4>${this.uiLanguage === 'en' ? 'Example' : 'Ejemplo'}</h4><pre>${String(level.content.example).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`
        : ''

      if (this.uiLanguage === 'en') {
        return `
          <p><strong>Level objective:</strong> ${this.getLocalizedText(levelObjective)}</p>
          <h4>How to study this level</h4>
          <ol>
            <li><strong>Understand:</strong> identify the main idea before memorizing syntax.</li>
            <li><strong>Practice:</strong> replicate the example and then build your own variant.</li>
            <li><strong>Verify:</strong> review common mistakes and validate your final result.</li>
          </ol>
          <h4>Key points</h4>
          ${theoryHtml}
          ${example}
          ${quizHtml}
          ${practiceHtml}
          <p><strong>Common mistake:</strong> ${this.getLocalizedText(phaseHint)}</p>
          <p><strong>Checklist:</strong> do I understand the concept, did I apply it in code, does my solution work?</p>
          <p><strong>Recommended reference:</strong> Review the official <a href="${languageUrl}" target="_blank" rel="noopener noreferrer">W3Schools (${currentLanguage || 'Tutorial'})</a> path to reinforce this topic.</p>
        `
      }

      return `
        <p><strong>Objetivo del nivel:</strong> ${levelObjective}</p>
        <h4>Cómo estudiar este nivel</h4>
        <ol>
          <li><strong>Comprende:</strong> identifica la idea principal antes de memorizar sintaxis.</li>
          <li><strong>Practica:</strong> replica el ejemplo y luego crea una variante propia.</li>
          <li><strong>Verifica:</strong> revisa errores comunes y valida tu resultado final.</li>
        </ol>
        <h4>Puntos clave</h4>
        ${theoryHtml}
        ${example}
        ${quizHtml}
        ${practiceHtml}
        <p><strong>Error frecuente:</strong> ${phaseHint}</p>
        <p><strong>Checklist:</strong> ¿entiendo el concepto?, ¿lo apliqué en código?, ¿mi solución funciona?</p>
        <p><strong>Referencia recomendada:</strong> Revisa el temario oficial de <a href="${languageUrl}" target="_blank" rel="noopener noreferrer">W3Schools (${currentLanguage || 'Tutorial'})</a> para reforzar este tema.</p>
      `
    },
    openTheoryLevel(language, level) {
      if (!this.isTheoryLevelUnlocked(language, level.id)) {
        return
      }

      const directNotes = String(level?.fallbackNotesHtml || '').trim()
      const shouldUseGeneratedNotes = this.uiLanguage === 'en'

      this.selectedTheoryLesson = {
        id: `${language}-${level.id}`,
        title: this.getDisplayLevelName(level),
        notes: shouldUseGeneratedNotes ? this.buildTheoryNotes(level, language) : (directNotes || this.buildTheoryNotes(level, language)),
        completed: level.completed,
        levelId: level.id,
        language
      }
      this.selectedLessonId = this.selectedTheoryLesson.id
    },
    async ensureLanguageTheory(language) {
      const normalized = this.normalizeTechToLanguage(language)
      const cacheKey = `${normalized}::${this.uiLanguage}`

      if (this.languageTheoryState[cacheKey]?.loaded) {
        return
      }

      this.languageTheoryState = {
        ...this.languageTheoryState,
        [cacheKey]: {
          loaded: false,
          levels: [],
          completedCount: 0
        }
      }

      try {
        const [curriculumResponse, progressResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/learning/curricula/${encodeURIComponent(normalized)}?lang=${this.uiLanguage}`),
          this.user?.userId
            ? fetch(`${API_BASE_URL}/api/learning/progress/${this.user.userId}/${encodeURIComponent(normalized)}`)
            : Promise.resolve(null)
        ])

        let levels = []
        if (curriculumResponse?.ok) {
          const curriculumData = await curriculumResponse.json()
          levels = Array.isArray(curriculumData?.curriculum?.levels) ? curriculumData.curriculum.levels : []
        }

        let completedCount = 0
        if (progressResponse?.ok) {
          const progressData = await progressResponse.json()
          const completedLevels = progressData?.progress?.completedLevels || []
          completedCount = Array.isArray(completedLevels) ? completedLevels.length : 0
        }

        this.languageTheoryState = {
          ...this.languageTheoryState,
          [cacheKey]: {
            loaded: true,
            levels,
            completedCount
          }
        }
      } catch (error) {
        this.languageTheoryState = {
          ...this.languageTheoryState,
          [cacheKey]: {
            loaded: true,
            levels: [],
            completedCount: 0
          }
        }
      }
    },
    isLessonUnlocked(lessonIndex) {
      if (lessonIndex === 0) return true
      return this.selectedCourse.lessons[lessonIndex - 1]?.completed || false
    },
    getLessonClass(index) {
      const lesson = this.selectedCourse.lessons[index]
      if (lesson.completed) return 'completed'
      if (lesson.started) return 'started'
      if (this.isLessonUnlocked(index)) return 'unlocked'
      return 'locked'
    },
    async startLesson(courseId, lessonId) {
      const nextPath = { ...this.learningPath }
      if (!nextPath.startedLessons) nextPath.startedLessons = []
      if (!nextPath.startedLessons.includes(lessonId)) {
        nextPath.startedLessons.push(lessonId)
      }
      await this.persistLearningPath(nextPath)
    },
    async toggleLessonComplete(courseId, lessonId) {
      const nextPath = { ...this.learningPath }
      if (!nextPath.completedLessons) nextPath.completedLessons = []

      const index = nextPath.completedLessons.indexOf(lessonId)
      if (index >= 0) {
        nextPath.completedLessons.splice(index, 1)
      } else {
        nextPath.completedLessons.push(lessonId)
      }

      await this.persistLearningPath(nextPath)
    },
    getTechIcon(tech) {
      const iconMap = {
        'HTML': '/images/html-removebg-preview.png',
        'CSS': '/images/css-removebg-preview.png',
        'JavaScript': '/images/javaScript-removebg-preview.png',
        'Python': '/images/python-removebg-preview.png',
        'Java': '/images/java-removebg-preview.png',
        'MySQL': '/images/sql-removebg-preview.png',
        'SQL': '/images/sql-removebg-preview.png',
        'PHP': '/images/php-removebg-preview.png',
        'Node': '/images/nodejs-removebg-preview.png',
        'Vue': '/images/vue-removebg-preview.png',
        'Spring': '/images/spring-removebg-preview.png',
        'APIs': '/images/apis-removebg-preview.png',
        'APIs REST': '/images/apis-removebg-preview.png'
      }
      return iconMap[tech] || '/images/Coding-404-logo.png'
    },
    async persistLearningPath(nextPath) {
      this.$emit('user-updated', {
        ...(this.user || {}),
        learningPath: nextPath
      })

      if (this.user?.userId) {
        try {
          await fetch(`${API_BASE_URL}/api/auth/user/${this.user.userId}/learning`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ learningPath: nextPath })
          })
        } catch (error) {
          console.error('Error al guardar progreso:', error)
        }
      }
    },
    selectLesson(lessonId) {
      this.selectedTheoryLesson = null
      this.selectedLessonId = lessonId
      // Iniciar la lección automáticamente
      this.startLesson(this.selectedCourseId, lessonId)
    },
    async toggleLanguage(language) {
      // Cambiar el estado de expansión del lenguaje
      if (this.expandedLanguages[language] === true) {
        this.expandedLanguages = {
          ...this.expandedLanguages,
          [language]: false
        }
      } else {
        this.expandedLanguages = {
          ...this.expandedLanguages,
          [language]: true
        }
        this.ensureLanguageTheory(language)
      }
    },
    goBackToCourse() {
      this.selectedLessonId = ''
      this.selectedTheoryLesson = null
    },
    async markLessonComplete() {
      if (this.isTheoryView) {
        return
      }

      const nextPath = { ...this.learningPath }
      if (!nextPath.completedLessons) nextPath.completedLessons = []

      if (!nextPath.completedLessons.includes(this.selectedLessonId)) {
        nextPath.completedLessons.push(this.selectedLessonId)
      }

      await this.persistLearningPath(nextPath)
    },
    getLessonLevelNumber() {
      if (this.selectedTheoryLesson?.levelId) {
        return this.selectedTheoryLesson.levelId
      }

      if (!this.selectedLesson || !this.selectedCourse) return 'N/A'
      const index = this.selectedCourse.lessons.findIndex((l) => l.id === this.selectedLessonId)
      return index >= 0 ? index + 1 : 'N/A'
    },
    isCurrentLessonUnlocked() {
      if (this.isTheoryView) {
        return true
      }

      if (!this.selectedLesson || !this.selectedCourse) return false
      const index = this.selectedCourse.lessons.findIndex((l) => l.id === this.selectedLessonId)
      return this.isLessonUnlocked(index)
    },
    async loadLearningPathFromServer() {
      if (!this.user?.userId) return

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/user/${this.user.userId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.user?.learningPath) {
            // Actualizar el learningPath con los datos del servidor
            const receivedLearningPath = data.user.learningPath
            // Emitir evento para que App.vue actualice currentUser
            this.$emit('user-updated', {
              ...this.user,
              learningPath: receivedLearningPath
            })
          }
        }
      } catch (error) {
        console.error('Error cargando learning path del servidor:', error)
      }
    }
  },
  watch: {
    activeSection: {
      handler(newSection) {
        if (newSection === 'lecciones') {
          this.refreshUiLanguageFromStorage()
          this.reloadExpandedTheorySections()
        }
      }
    },
    user: {
      handler(newUser) {
        if (newUser?.userId) {
          // Cuando cambia el usuario, recargar su learning path del servidor
          this.loadLearningPathFromServer()
        }
      },
      deep: true
    }
  },
  mounted() {
    this.refreshUiLanguageFromStorage()
    window.addEventListener('storage', this.handleStorageUpdate)

    // Al montar el componente, cargar el learning path del servidor
    if (this.user?.userId) {
      this.loadLearningPathFromServer()
    }
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageUpdate)
  }
}
</script>

<style scoped>
.lecciones-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1f3cff 0%, #2c49ff 100%);
  display: flex;
  flex-direction: column;
  padding-bottom: 80px;
}

.content-area {
  flex: 1;
  padding: 20px 14px;
  color: #fff;
  overflow-y: auto;
}

.content-area h1 {
  font-size: 30px;
  margin-bottom: 6px;
  color: #fff;
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 20px 0 16px;
}

/* Vista de cursos */
.courses-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.course-card {
  background: linear-gradient(135deg, rgba(74, 63, 168, 0.9) 0%, rgba(45, 31, 92, 0.9) 100%);
  border: 2px solid rgba(157, 243, 182, 0.3);
  border-radius: 24px;
  padding: 28px 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 240px;
  justify-content: space-between;
  gap: 16px;
}

.course-card:hover {
  border-color: rgba(157, 243, 182, 0.7);
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(13, 226, 143, 0.3);
  background: linear-gradient(135deg, rgba(85, 73, 184, 0.95) 0%, rgba(54, 35, 112, 0.95) 100%);
}

.card-tech-icons {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  order: 1;
}

.card-icon {
  height: 64px;
  object-fit: contain;
  transition: all 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.card-icon:hover {
  transform: scale(1.2);
  filter: drop-shadow(0 8px 16px rgba(157, 243, 182, 0.5));
}

.course-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  order: 2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.course-progress-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  background: rgba(0, 0, 0, 0.15);
  padding: 10px 20px;
  border-radius: 12px;
  width: 100%;
  order: 3;
}

.progress-label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.progress-numbers {
  font-size: 18px;
  font-weight: 800;
  color: #9df3b6;
}

.course-header {
  display: none;
}

.progress-badge {
  background: rgba(157, 243, 182, 0.15);
  color: #9df3b6;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  display: none;
}

.course-languages {
  display: none;
}

.lang-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  display: none;
}

.language-icons {
  display: none;
}

.language-icon {
  height: 32px;
  object-fit: contain;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  display: none;
}

.language-icon:hover {
  transform: scale(1.15);
  filter: drop-shadow(0 4px 8px rgba(157, 243, 182, 0.4));
}

.course-description {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  display: none;
}

.course-footer {
  display: none;
}

.progress-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  overflow: hidden;
  display: none;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #9df3b6 0%, #5df394 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
  display: none;
}

/* Vista de detalle del curso */
.course-detail-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 24px;
  background: rgba(74, 63, 168, 0.3);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(157, 243, 182, 0.2);
}

.back-btn {
  background: rgba(157, 243, 182, 0.15);
  border: none;
  color: #9df3b6;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.back-btn:hover {
  background: rgba(157, 243, 182, 0.25);
  transform: scale(1.05);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.course-detail-header h2 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.course-desc {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* Sección de lecciones */
.lessons-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.lesson-item {
  padding: 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.lesson-item.completed {
  background: rgba(157, 243, 182, 0.15);
  border-color: rgba(157, 243, 182, 0.4);
}

.lesson-item.started {
  background: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.4);
}

.lesson-item.unlocked {
  background: rgba(74, 63, 168, 0.3);
  border-color: rgba(157, 243, 182, 0.3);
}

.lesson-item.locked {
  background: rgba(100, 100, 100, 0.1);
  border-color: rgba(100, 100, 100, 0.2);
  opacity: 0.65;
}

.lesson-header {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
}

.lesson-lock {
  font-size: 28px;
  flex-shrink: 0;
  min-width: 32px;
  text-align: center;
}

.lesson-info {
  flex: 1;
}

.lesson-name {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.lesson-level {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.lesson-item.completed .lesson-name {
  color: #9df3b6;
}

.lesson-item.started .lesson-name {
  color: #ffc107;
}

.lesson-item.locked .lesson-name {
  color: rgba(255, 255, 255, 0.6);
}

/* Lenguajes expandibles */
.languages-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.language-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 12px;
  background: rgba(74, 63, 168, 0.2);
  border: 1px solid rgba(157, 243, 182, 0.2);
  overflow: hidden;
}

.language-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(74, 63, 168, 0.3);
  border: none;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(157, 243, 182, 0.2);
}

.language-header:hover {
  background: rgba(85, 73, 184, 0.4);
}

.lang-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 16px;
}

.language-header-icon {
  height: 32px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.expand-icon {
  width: 20px;
  height: 20px;
  color: #9df3b6;
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

/* Lista de lecciones */
.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}

.lesson-empty {
  margin: 4px 0;
  padding: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.06);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.lesson-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(100, 100, 100, 0.15);
  border: 1px solid rgba(157, 243, 182, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lesson-row:hover {
  background: rgba(100, 100, 100, 0.25);
  border-color: rgba(157, 243, 182, 0.4);
}

.lesson-row.unlocked {
  background: rgba(157, 243, 182, 0.1);
  border-color: rgba(157, 243, 182, 0.3);
}

.lesson-row.unlocked:hover {
  background: rgba(157, 243, 182, 0.15);
}

.lesson-row.completed {
  background: rgba(157, 243, 182, 0.2);
  border-color: rgba(157, 243, 182, 0.5);
}

.lesson-row.started {
  background: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.3);
}

.lesson-row.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.lesson-lock {
  font-size: 20px;
  flex-shrink: 0;
  min-width: 28px;
  text-align: center;
}

.lesson-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lesson-item-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.lesson-row.completed .lesson-item-name {
  color: #9df3b6;
}

.lesson-row.locked .lesson-item-name {
  color: rgba(255, 255, 255, 0.6);
}

.lesson-item-level {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.lesson-completed {
  font-size: 18px;
  color: #9df3b6;
  flex-shrink: 0;
}

/* Vista de apuntes */
.lesson-detail-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 24px;
  background: rgba(74, 63, 168, 0.3);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(157, 243, 182, 0.2);
}

.lesson-detail-header h2 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.lesson-meta {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.lesson-content-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.lesson-notes {
  background: rgba(74, 63, 168, 0.2);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(157, 243, 182, 0.2);
}

.lesson-notes h3 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.notes-content {
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
}

.notes-content h4 {
  margin: 16px 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #9df3b6;
}

.notes-content p {
  margin: 8px 0;
  font-size: 14px;
}

.notes-content pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.notes-content ul, .notes-content ol {
  margin: 8px 0;
  padding-left: 20px;
}

.notes-content li {
  margin: 4px 0;
}

.lesson-detail-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(157, 243, 182, 0.2);
}

.action-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, rgba(157, 243, 182, 0.3) 0%, rgba(93, 243, 148, 0.2) 100%);
  border: 1px solid rgba(157, 243, 182, 0.4);
  color: #9df3b6;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(157, 243, 182, 0.5) 0%, rgba(93, 243, 148, 0.3) 100%);
  border-color: rgba(157, 243, 182, 0.6);
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, rgba(100, 100, 100, 0.2) 0%, rgba(80, 80, 80, 0.1) 100%);
  border-color: rgba(100, 100, 100, 0.3);
  color: rgba(157, 243, 182, 0.6);
}

.lesson-content {
  font-weight: 600;
}

.status-started {
  color: #ffc107;
  font-weight: 600;
}

.status-locked {
  color: #ff6b6b;
  font-weight: 600;
}

.lesson-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.lesson-btn {
  padding: 6px 12px;
  background: rgba(157, 243, 182, 0.2);
  border: 1px solid rgba(157, 243, 182, 0.4);
  color: #9df3b6;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.lesson-btn:hover {
  background: rgba(157, 243, 182, 0.3);
  border-color: rgba(157, 243, 182, 0.6);
}

.lesson-btn.secondary {
  background: rgba(100, 150, 255, 0.2);
  border-color: rgba(100, 150, 255, 0.4);
  color: #6496ff;
}

.lesson-btn.secondary:hover {
  background: rgba(100, 150, 255, 0.3);
  border-color: rgba(100, 150, 255, 0.6);
}

/* Bottom navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #233dff;
  border-top: 1px solid #1a28cc;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 70px;
  z-index: 100;
}

.nav-item {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0;
  cursor: pointer;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.nav-item.has-alert {
  position: relative;
}

.menu-alert-badge {
  position: absolute;
  top: 8px;
  left: calc(50% + 6px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #ff4d4f;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  font-weight: 700;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.9);
}

.nav-item svg {
  width: 31px;
  height: 31px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #fff;
  transform: scale(1.1);
}

.nav-item.active {
  color: #fff;
  background: rgba(0, 0, 0, 0.2);
}

.nav-item.active svg {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
}

/* Responsive */
@media (max-width: 480px) {
  .bottom-nav {
    height: 60px;
  }

  .nav-item {
    gap: 0;
  }

  .nav-item svg {
    width: 26px;
    height: 26px;
  }

  .course-card {
    padding: 14px;
  }

  .course-title {
    font-size: 16px;
  }

  .lesson-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .lesson-actions {
    width: 100%;
    justify-content: stretch;
  }

  .lesson-actions .lesson-btn {
    flex: 1;
  }
}

.progress-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.label-text {
  font-weight: 600;
}

.label-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.completed-languages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.completed-language-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.completed-language-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.language-header-btn {
  width: 100%;
  padding: 16px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.language-header-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.language-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  text-align: left;
}

.language-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.language-name {
  font-weight: 600;
}

.completion-badge {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-left: auto;
}

.expand-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
  color: rgba(255, 255, 255, 0.6);
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.completed-levels-list {
  padding: 0 16px 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  background: rgba(0, 0, 0, 0.2);
}

.completed-level-item {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.completed-level-item:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
}

.level-number {
  font-weight: 600;
  font-size: 11px;
}

.level-icon {
  font-size: 16px;
}

.section-divider {
  height: 2px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.1) 100%);
  margin: 40px 0;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  margin-bottom: 30px;
}

.empty-state p {
  margin: 8px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.empty-state p:first-child {
  font-weight: 600;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
}
</style>
