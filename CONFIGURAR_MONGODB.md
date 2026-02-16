# 🔧 Configuración de MongoDB Atlas - Paso a Paso

## Ya tienes la base de datos "coding404" creada ✅

Ahora necesitas obtener el **String de Conexión** y configurarlo en el archivo `.env`

---

## 📝 Pasos para obtener el String de Conexión:

### 1. Ve a MongoDB Atlas
   - Abre https://cloud.mongodb.com/
   - Inicia sesión con tu cuenta

### 2. Selecciona tu Cluster
   - Haz clic en el botón **"Connect"** de tu cluster

### 3. Elige "Connect your application"
   - Selecciona **"Drivers"**
   - Driver: **Node.js**
   - Version: **5.5 or later**

### 4. Copia tu Connection String
   Verás algo como:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 5. Personalízalo para Coding404
   - Reemplaza `<username>` con tu usuario de MongoDB
   - Reemplaza `<password>` con tu contraseña
   - Después de `.net/` añade `coding404` (el nombre de tu base de datos)
   
   **Ejemplo final:**
   ```
   mongodb+srv://miusuario:mipassword123@cluster0.abcd123.mongodb.net/coding404?retryWrites=true&w=majority
   ```

---

## ⚙️ Configurar el archivo .env

1. Abre el archivo: `backend\.env`

2. Reemplaza la línea `MONGO_URI=` con tu string de conexión:

```env
MONGO_URI=mongodb+srv://tuusuario:tupassword@cluster0.xxxxx.mongodb.net/coding404?retryWrites=true&w=majority
```

3. Guarda el archivo

---

## ✅ Verificar la Conexión

En la terminal del **backend**, ejecuta:

```powershell
npm run seed
```

Si todo está bien, verás:
- `✅ Conectado a MongoDB`
- `✅ Cursos creados`  
- `✅ Lecciones creadas`
- `✅ Ejercicios creados`
- `✅ Datos de ejemplo creados exitosamente`

---

## ⚠️ Errores Comunes

### Error: "MongoServerError: bad auth"
- **Solución**: Verifica tu usuario y contraseña en el string de conexión

### Error: "no suitable servers found"
- **Solución**: Añade tu IP a la lista blanca en MongoDB Atlas
  1. Ve a "Network Access" en Atlas
  2. Clic en "Add IP Address"  
  3. Selecciona "Allow Access from Anywhere" (0.0.0.0/0) para desarrollo

### Error: "ENOTFOUND"
- **Solución**: Verifica que el cluster URL sea correcto

---

## 🚀 Una vez configurado

```powershell
# Terminal 1 - Backend
cd backend
npm run seed    # Poblar base de datos
npm run dev     # Iniciar servidor

# Terminal 2 - Frontend  
cd frontend
npm run dev     # Iniciar app
```

Abre: http://localhost:8080

---

¿Necesitas ayuda? Avísame! 💪
