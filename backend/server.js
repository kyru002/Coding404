const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const { learningRouter, ensureCurriculaClassified, ensureLeaguesSeeded } = require('./routes/learning');
const { socialRouter, ensureDemoUsersSeeded } = require('./routes/social');

// Cargar variables de entorno
dotenv.config({ path: '.env.local', quiet: true });

const app = express();
const PORT = process.env.PORT || 5000;

const isDatabaseReady = () => mongoose.connection.readyState === 1;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

app.use('/api', (req, res, next) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ message: 'Base de datos no disponible. Intenta de nuevo en unos segundos.' });
  }

  return next();
});

// Rutas de autenticacion
app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRouter);
app.use('/api/social', socialRouter);

// Conexión a MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await ensureCurriculaClassified();
    await ensureLeaguesSeeded();
    if (String(process.env.SEED_DEMO_USERS || '').toLowerCase() === 'true') {
      await ensureDemoUsersSeeded();
    }
  } catch (error) {
    console.error('❌ Error al inicializar backend:', error.message);
    process.exit(1);
  }
};

// Iniciar servidor solo cuando la DB esté conectada
const startServer = async () => {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Backend listo en http://localhost:${PORT} (DB + temarios ES/EN + ligas)`);
  });
};

startServer();
