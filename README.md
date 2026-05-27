# Coding404

Plataforma de aprendizaje de programacion con frontend en Vue y backend en Node.js/Express + MongoDB.

## Stack
- Frontend: Vue 3 + Vite
- Backend: Node.js + Express + Mongoose
- Database: MongoDB Atlas
- Real-time: Socket.IO

## Monorepo Structure
- Frontend: aplicacion cliente
- Backend: API, modelos, rutas y scripts de seed
- scripts: utilidades para levantar frontend y backend en paralelo

## Run Locally

### 1) Install dependencies
```bash
npm install
npm install --prefix Backend
npm install --prefix Frontend
```

### 2) Environment variables
Crea estos archivos a partir de los ejemplos:
- Backend/.env.local desde Backend/.env.example
- Frontend/.env.local desde Frontend/.env.example

Variables importantes de backend:
- MONGODB_URI
- EMAIL_USER
- EMAIL_PASSWORD
- ADMIN_PASSWORD
- DEMO_USERS_PASSWORD
- DEMO_USER_PASSWORD
- SEED_DEFAULT_PASSWORD

### 3) Start dev servers
```bash
npm run dev
```

Esto inicia:
- Backend en http://localhost:5000
- Frontend en http://localhost:5173

## Security Notes
- No se deben commitear secretos ni credenciales reales.
- No usar contraseñas hardcodeadas en codigo ni scripts.
- No enviar contraseñas en texto plano por email.
- Rotar credenciales inmediatamente si se expusieron antes.

## Portfolio Checklist
Antes de publicar en GitHub como proyecto publico:
- Verificar que no existan secretos en git history.
- Configurar variables de entorno en plataforma de deploy.
- Añadir capturas del proyecto en esta documentacion.
- Incluir enlace a demo online y descripcion de arquitectura.

## Suggested Deploy
- Frontend: Vercel o Netlify
- Backend: Render, Railway o Fly.io
- MongoDB: Atlas

## License
Este proyecto usa licencia MIT. Ver LICENSE.
