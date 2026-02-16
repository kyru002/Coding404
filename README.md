# Coding404 - Aplicación Móvil de Aprendizaje de Programación

Una aplicación móvil interactiva para aprender programación de forma gamificada, similar a Duolingo y Mimo, pero enfocada específicamente en programación.

## 🚀 Características

- 📱 **Multiplataforma**: Funciona en iOS y Android
- 🎮 **Aprendizaje Gamificado**: Sistema de XP, niveles y rachas
- 💻 **Cursos Interactivos**: JavaScript, Python, y más
- ✏️ **Ejercicios Variados**: Múltiple opción, código, quizzes
- 📊 **Seguimiento de Progreso**: Monitorea tu avance
- 🔒 **Autenticación**: Sistema seguro de login y registro

## 🛠️ Stack Tecnológico

### Frontend
- **Vue 3** - Framework JavaScript
- **Ionic Framework** - UI Components
- **Capacitor** - Bridge nativo
- **Pinia** - State Management
- **Vue Router** - Navegación
- **Axios** - HTTP Client

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **MongoDB Atlas** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Encriptación

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/coding404.git
cd coding404
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crea un archivo `.env`:

```env
MONGO_URI=mongodb+srv://tu_usuario:tu_password@cluster0.xxxxx.mongodb.net/coding404
JWT_SECRET=tu_clave_secreta_jwt
PORT=5000
CLIENT_URL=http://localhost:8080
```

Poblar la base de datos:

```bash
npm run seed
```

Iniciar el servidor:

```bash
npm run dev
```

### 3. Configurar el Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

Iniciar la aplicación:

```bash
npm run dev
```

## 📱 Compilar para Móvil

### Android

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

### iOS

```bash
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

## 🗂️ Estructura del Proyecto

```
Coding404/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración DB
│   │   ├── models/         # Modelos Mongoose
│   │   ├── routes/         # Rutas API
│   │   └── utils/          # Utilidades y seed
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── assets/         # Imágenes, estilos
    │   ├── components/     # Componentes Vue
    │   ├── views/          # Vistas/Páginas
    │   ├── router/         # Configuración Router
    │   ├── stores/         # Pinia Stores
    │   ├── services/       # Servicios API
    │   ├── App.vue
    │   └── main.js
    ├── capacitor.config.js
    ├── package.json
    └── vite.config.js
```

## 🔑 Endpoints API

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

### Cursos
- `GET /api/courses` - Listar cursos
- `GET /api/courses/:id` - Obtener curso
- `GET /api/courses/:id/lessons` - Lecciones del curso

### Lecciones
- `GET /api/lessons/:id` - Obtener lección
- `GET /api/lessons/:id/exercises` - Ejercicios

### Ejercicios
- `GET /api/exercises/:id` - Obtener ejercicio
- `POST /api/exercises/:id/check` - Verificar respuesta

### Progreso
- `GET /api/progress/user/:userId` - Progreso del usuario
- `POST /api/progress` - Guardar progreso

## 🎨 Diseño

El diseño está basado en el prototipo de Figma:
https://eraser-dizzy-16171267.figma.site/

## 📝 Scripts Disponibles

### Backend
- `npm start` - Iniciar servidor
- `npm run dev` - Modo desarrollo (nodemon)
- `npm run seed` - Poblar BD con datos

### Frontend
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Vista previa del build
- `npm run android` - Compilar Android
- `npm run ios` - Compilar iOS

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👨‍💻 Autor

**Tu Nombre**

---

¡Hecho con ❤️ y mucho ☕!
