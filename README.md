# Coding404

Plataforma de aprendizaje de programacion con frontend en Vue y backend en Node.js/Express + MongoDB.Proyecto de final de grado superior de DAW 

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



## Suggested Deploy
- Frontend: Vercel o Netlify
- Backend: Render, Railway o Fly.io
- MongoDB: Atlas

## License
Este proyecto usa licencia MIT. Ver LICENSE.
