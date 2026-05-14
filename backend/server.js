const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const authRoutes = require('./routes/auth');
const { learningRouter, ensureCurriculaClassified, ensureLeaguesSeeded } = require('./routes/learning');
const { socialRouter, ensureDemoUsersSeeded, initSocketIO } = require('./routes/social');

// Cargar variables de entorno
dotenv.config({ path: '.env.local', quiet: true });

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const isDatabaseReady = () => mongoose.connection.readyState === 1;

// Caché simple en memoria para currículum (24 horas)
const curriculumCache = new Map();
const CURRICULUM_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

// Middlewares
app.use(cors());
app.use(compression()); // Compresión gzip automática
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting: 100 requests por 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting más estricto para endpoints críticos (login, progreso)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Demasiadas solicitudes a este endpoint. Intenta de nuevo más tarde.',
  skipSuccessfulRequests: false,
});

// Aplicar rate limiting global
app.use('/api/', limiter);

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

// Rutas de autenticacion con rate limiting estricto
app.use('/api/auth', strictLimiter, authRoutes);
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
    throw error;
  }
};

// Iniciar servidor solo cuando la DB esté conectada
const startServer = async () => {
  initSocketIO(server);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Backend listo en http://localhost:${PORT} (DB + temarios ES/EN + ligas)`);
  });

  try {
    await connectDB();
  } catch (error) {
    console.error('❌ Error al inicializar backend:', error.message);
  }
};

startServer();
