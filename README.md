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
- Frontend: GitHub Pages, Vercel o Netlify
- Backend: Render, Railway o Fly.io
- MongoDB: Atlas

### GitHub Pages
Si quieres usar GitHub Pages, no actives la carpeta del repositorio como fuente. Debes publicar el build de Vite (`Frontend/dist`).

Pasos:
1. Ve a Settings > Pages en GitHub.
2. En Source, elige GitHub Actions.
3. Haz push a la rama `main` o `feature/demo-full-progress`.
4. El workflow `.github/workflows/deploy-pages.yml` compila `Frontend` y publica `Frontend/dist`.

Notas:
- La app está configurada con base `/Coding404/` para Pages.
- Si cambias el nombre del repo, actualiza `base` en `Frontend/vite.config.js`.
- El backend debe estar desplegado aparte y `VITE_API_URL` debe apuntar a su URL pública.

## License
Este proyecto usa licencia MIT. Ver LICENSE.
