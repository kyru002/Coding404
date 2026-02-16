# 🌐 Crear y Configurar MongoDB Atlas - Guía Completa

## 📋 Paso 1: Crear cuenta en MongoDB Atlas

1. Ve a: **https://www.mongodb.com/cloud/atlas/register**
2. Regístrate con tu email o cuenta de Google
3. Completa el formulario (puedes saltar las preguntas opcionales)

---

## 🚀 Paso 2: Crear un Cluster GRATIS

1. Después de iniciar sesión, verás "Create a deployment"
2. Haz clic en **"+ Create"** o **"Build a Database"**

3. **Selecciona el plan GRATIS:**
   - Elige **M0 (FREE)**
   - ✅ 512 MB de almacenamiento gratis
   - ✅ Perfecto para desarrollo

4. **Configurar el cluster:**
   - **Cloud Provider**: AWS (o el que prefieras)
   - **Region**: Elige la más cercana a ti (ej: Europe - Ireland)
   - **Cluster Name**: Déjalo como "Cluster0" o cámbialo a "Coding404Cluster"
   
5. Haz clic en **"Create Cluster"** (tarda 1-3 minutos)

---

## 👤 Paso 3: Crear Usuario de Base de Datos

Mientras se crea el cluster, te pedirá crear un usuario:

### Opción A: Si aparece el formulario automáticamente
1. **Username**: Elige uno (ej: `coding404user`)
2. **Password**: Crea una contraseña segura (ej: `Coding404Pass123`)
   - ⚠️ **MUY IMPORTANTE**: Guarda este usuario y contraseña, los necesitarás después
3. Haz clic en **"Create User"**

### Opción B: Si no apareció, créalo manualmente
1. En el menú izquierdo, ve a **"Database Access"**
2. Haz clic en **"+ Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `coding404user`
5. **Password**: Autogenerate o crea una (ej: `Coding404Pass123`)
   - ⚠️ Copia y guarda la contraseña
6. **Database User Privileges**: Selecciona **"Read and write to any database"**
7. Haz clic en **"Add User"**

---

## 🌍 Paso 4: Permitir Acceso desde tu IP

Necesitas permitir que tu computadora se conecte:

1. En el menú izquierdo, ve a **"Network Access"**
2. Haz clic en **"+ Add IP Address"**
3. **Opción 1 (Recomendada para desarrollo):**
   - Haz clic en **"Allow Access from Anywhere"**
   - Esto añade `0.0.0.0/0` (permite acceso desde cualquier IP)
   - ⚠️ Solo para desarrollo, NO para producción
4. **Opción 2 (Más segura):**
   - Haz clic en **"Add Current IP Address"**
   - Añade solo tu IP actual
5. Haz clic en **"Confirm"**

---

## 🔗 Paso 5: Obtener el Connection String

1. Ve a **"Database"** en el menú izquierdo
2. Verás tu cluster, haz clic en el botón **"Connect"**
3. Selecciona **"Drivers"** (o "Connect your application")
4. **Driver**: Node.js
5. **Version**: 5.5 or later (o la última disponible)

6. Verás un **Connection String** como este:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

7. **Cópialo y personalízalo:**
   - Reemplaza `<username>` con: `coding404user` (o el usuario que creaste)
   - Reemplaza `<password>` con tu contraseña (ej: `Coding404Pass123`)
   - Después de `.net/` añade `coding404` (nombre de la base de datos)
   
   **Ejemplo final:**
   ```
   mongodb+srv://coding404user:Coding404Pass123@cluster0.abc123.mongodb.net/coding404?retryWrites=true&w=majority
   ```

---

## ⚙️ Paso 6: Configurar en tu proyecto

1. Abre el archivo **`backend\.env`** en tu proyecto

2. Pega tu connection string en la línea `MONGO_URI`:

```env
MONGO_URI=mongodb+srv://coding404user:Coding404Pass123@cluster0.abc123.mongodb.net/coding404?retryWrites=true&w=majority
JWT_SECRET=coding404_secret_key_super_segura_2026
JWT_EXPIRE=30d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:8080
```

3. **Guarda el archivo**

---

## ✅ Paso 7: Probar la Conexión

En la terminal (carpeta backend):

```powershell
npm run seed
```

**Si todo está bien, verás:**
```
✅ Conectado a MongoDB
🗑️  Datos anteriores eliminados
✅ Cursos creados
✅ Lecciones creadas
✅ Ejercicios creados
✅ Datos de ejemplo creados exitosamente
📚 2 cursos
📖 3 lecciones
✏️  3 ejercicios
```

---

## 🎉 Paso 8: Ver tus datos en MongoDB Atlas

1. Ve a **"Database"** → **"Browse Collections"**
2. Verás la base de datos **"coding404"** con las colecciones:
   - courses
   - lessons
   - exercises
   - users
   - progresses

---

## ❌ Solución de Problemas

### Error: "bad auth" o "Authentication failed"
- ✅ Verifica que el usuario y contraseña sean correctos
- ✅ NO uses caracteres especiales en la contraseña (@, #, etc.) o encódalos
- ✅ Asegúrate de haber reemplazado `<username>` y `<password>`

### Error: "no suitable servers found" o "ENOTFOUND"
- ✅ Verifica que la URL del cluster sea correcta
- ✅ Espera 1-2 minutos si acabas de crear el cluster
- ✅ Revisa tu conexión a internet

### Error: "IP not whitelisted"
- ✅ Ve a "Network Access" en Atlas
- ✅ Añade tu IP o usa 0.0.0.0/0

### La base de datos no aparece
- ✅ Es normal, aparecerá después de ejecutar `npm run seed`
- ✅ MongoDB crea la base de datos automáticamente al insertar datos

---

## 📝 Resumen del Connection String

```
mongodb+srv://[USUARIO]:[CONTRASEÑA]@[CLUSTER-URL]/coding404?retryWrites=true&w=majority
                ↑            ↑              ↑            ↑
              tu user   tu password    del cluster   nombre DB
```

**Ejemplo real:**
```
mongodb+srv://coding404user:MiPass123@cluster0.abc12.mongodb.net/coding404?retryWrites=true&w=majority
```

---

## 🚀 Siguiente Paso

Una vez configurado MongoDB, ejecuta:

```powershell
# Terminal 1 - Backend
cd backend
npm run seed    # Crear datos de ejemplo
npm run dev     # Iniciar servidor API

# Terminal 2 - Frontend
cd frontend
npm install     # Si no lo has hecho
npm run dev     # Iniciar aplicación
```

Abre: **http://localhost:8080** 🎉

---

¿Necesitas ayuda? ¡Dime en qué paso estás! 💪
