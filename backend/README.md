# Coding404 Backend

API REST para la plataforma de aprendizaje de programación Coding404.

## 🚀 Tecnologías

- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication

## 📦 Instalación

```bash
cd backend
npm install
```

## ⚙️ Configuración

1. Crea un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

2. Configura tus variables de entorno en `.env`:
   - `MONGO_URI`: Tu string de conexión de MongoDB Atlas
   - `JWT_SECRET`: Una clave secreta para JWT
   - `PORT`: Puerto del servidor (default: 5000)

## 🗄️ Base de Datos

Para poblar la base de datos con datos de ejemplo:

```bash
npm run seed
```

## 🏃 Ejecución

### Modo desarrollo (con nodemon):
```bash
npm run dev
```

### Modo producción:
```bash
npm start
```

## 📡 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Cursos
- `GET /api/courses` - Obtener todos los cursos
- `GET /api/courses/:id` - Obtener un curso específico
- `GET /api/courses/:id/lessons` - Obtener lecciones de un curso
- `POST /api/courses` - Crear un nuevo curso

### Lecciones
- `GET /api/lessons/:id` - Obtener una lección
- `GET /api/lessons/:id/exercises` - Obtener ejercicios de una lección
- `POST /api/lessons` - Crear una nueva lección

### Ejercicios
- `GET /api/exercises/:id` - Obtener un ejercicio
- `POST /api/exercises/:id/check` - Verificar respuesta
- `POST /api/exercises` - Crear un nuevo ejercicio

### Progreso
- `GET /api/progress/user/:userId` - Obtener progreso del usuario
- `GET /api/progress/user/:userId/course/:courseId` - Progreso en un curso
- `POST /api/progress` - Guardar progreso

## 🧪 Verificar API

```bash
curl http://localhost:5000/api/health
```
