# 🚀 Guía de Inicio Rápido - Coding404

## ⚡ Puesta en Marcha (5 minutos)

### 1️⃣ Backend (Terminal 1)

```powershell
cd backend
npm install
```

**Configurar MongoDB Atlas:**
1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratis
3. Crea un nuevo cluster (free tier)
4. En "Database Access" → Crea un usuario con contraseña
5. En "Network Access" → Añade tu IP (0.0.0.0/0 para desarrollo)
6. Obtén tu connection string

**Crear archivo `.env` en la carpeta backend:**

```env
MONGO_URI=mongodb+srv://tu_usuario:tu_password@cluster0.xxxxx.mongodb.net/coding404?retryWrites=true&w=majority
JWT_SECRET=mi_clave_secreta_super_segura_12345
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:8080
```

**Poblar la base de datos con datos de ejemplo:**

```powershell
npm run seed
```

**Iniciar el servidor:**

```powershell
npm run dev
```

Deberías ver: `✅ MongoDB Atlas conectado` y `🚀 Servidor corriendo en puerto 5000`

---

### 2️⃣ Frontend (Terminal 2)

```powershell
cd frontend
npm install
```

**Crear archivo `.env.local` en la carpeta frontend (opcional):**

```env
VITE_API_URL=http://localhost:5000/api
```

**Iniciar la aplicación:**

```powershell
npm run dev
```

Abre tu navegador en: http://localhost:8080

---

## 📱 Compilar para Móvil

### Para Android:

```powershell
cd frontend
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Necesitas **Android Studio** instalado.

### Para iOS (solo Mac):

```powershell
cd frontend
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

Necesitas **Xcode** instalado.

---

## 🧪 Probar la Aplicación

1. Abre http://localhost:8080
2. Haz clic en **"Regístrate"**
3. Crea una cuenta de prueba:
   - Usuario: `testuser`
   - Email: `test@example.com`
   - Contraseña: `123456`
4. ¡Explora los cursos y lecciones!

---

## 📊 Datos de Ejemplo

El script `npm run seed` crea:
- 2 cursos (JavaScript y Python)
- 3 lecciones
- 3 ejercicios

---

## 🔧 Comandos Útiles

### Backend
```powershell
npm run dev      # Modo desarrollo con nodemon
npm start        # Modo producción
npm run seed     # Repoblar base de datos
```

### Frontend
```powershell
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Vista previa del build
```

---

## ❓ Solución de Problemas

### Error de conexión a MongoDB
- Verifica tu string de conexión en `.env`
- Asegúrate de que tu IP está en la whitelist de MongoDB Atlas
- Comprueba usuario y contraseña

### Error de CORS
- Verifica que `CLIENT_URL` en backend coincide con tu URL del frontend
- Reinicia el servidor backend

### La app no carga
- Verifica que el backend esté corriendo en puerto 5000
- Abre las DevTools del navegador (F12) para ver errores
- Comprueba la consola del servidor backend

---

## 📞 API Endpoints

**Test del servidor:**
```
GET http://localhost:5000/api/health
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Body: { "email": "test@example.com", "password": "123456" }
```

**Obtener cursos:**
```
GET http://localhost:5000/api/courses
```

---

## 🎯 Próximos Pasos

1. **Añadir más cursos y lecciones** → Edita `backend/src/utils/seed.js`
2. **Personalizar el diseño** → Modifica los componentes Vue en `frontend/src/views/`
3. **Añadir más tipos de ejercicios** → Extiende los modelos y componentes
4. **Implementar un sistema de logros** → Nueva colección en MongoDB
5. **Añadir notificaciones push** → Usar Capacitor Push Notifications

---

¡Disfruta construyendo tu app de aprendizaje! 🎉
