const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const UserLanguageProgress = require('../models/UserLanguageProgress');

// Cargar variables de entorno
dotenv.config({ path: '.env.local', quiet: true });

const LANGUAGES = ['HTML', 'CSS', 'JavaScript', 'Node.js', 'SQL', 'Python', 'Java', 'PHP'];
const LEVELS_PER_LANGUAGE = 30;

const getDemoPassword = () => {
  const primary = String(process.env.DEMO_USER_PASSWORD || '').trim();
  if (primary) return primary;
  const fallback = String(process.env.DEMO_USERS_PASSWORD || '').trim();
  if (fallback) return fallback;
  throw new Error('Falta DEMO_USER_PASSWORD o DEMO_USERS_PASSWORD en el entorno. Defínela en .env.local');
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');
  } catch (error) {
    console.error('✗ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

const createDemoUser = async () => {
  // Verificar si ya existe
  const existing = await User.findOne({ username: 'demo' });
  if (existing) {
    console.log('✓ Usuario Demo ya existe. Actualizando...');
    await existing.deleteOne();
  }

  // Crear contraseña hasheada desde variable de entorno
  const demoPassword = getDemoPassword();
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  // Generar todas las lecciones completadas
  const allLessons = [
    'frontend-html',
    'frontend-css',
    'frontend-javascript',
    'frontend-vue',
    'backend-java',
    'backend-php',
    'backend-python',
    'backend-nodejs',
    'database-mysql',
    ...Array.from({ length: 20 }, (_, i) => `lesson-${i + 1}`)
  ];

  // Crear el usuario Demo (usuario normal, NO admin)
  const demoUser = await User.create({
    fullName: 'Demo User',
    email: 'demo@coding404.dev',
    username: 'demo',
    passwordHash,
    programmerType: 'Full-Stack',
    role: 'user', // NOT admin - permite navegar libremente
    isBanned: false,
    learningPath: {
      preferredTrack: 'Full-Stack',
      recommendedCourse: 'frontend',
      activeCourse: 'frontend',
      startedCourses: ['frontend', 'backend', 'database'],
      startedLessons: allLessons,
      completedLessons: allLessons, // TODOS COMPLETADOS
    },
    github: {
      hasAccount: false,
      username: '',
    },
    bio: 'Usuario de demostración con acceso completo',
    avatarUrl: '',
    phone: '',
    registeredAt: new Date(),
  });

  console.log('✓ Usuario Demo creado:', demoUser.username);

  // Crear progreso de lenguajes completados (100% en todos)
  for (const language of LANGUAGES) {
    await UserLanguageProgress.findOneAndUpdate(
      { userId: demoUser._id, language },
      {
        userId: demoUser._id,
        language,
        completedLevels: Array.from({ length: LEVELS_PER_LANGUAGE }, (_, i) => i + 1),
        totalPoints: LEVELS_PER_LANGUAGE * 2, // 2 puntos por nivel
        createdAt: new Date(),
        lastActivityDate: new Date(),
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ ${language}: todos los ${LEVELS_PER_LANGUAGE} niveles completados`);
  }

  console.log('\n✓ Usuario Demo completamente configurado');
  console.log('\nCredenciales Demo:');
  console.log('  Username: demo');
  console.log('  Password: (definida por DEMO_USER_PASSWORD o DEMO_USERS_PASSWORD)');
  console.log('  Email: demo@coding404.dev');
};

const runCli = async () => {
  try {
    await connectDB();
    await createDemoUser();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creando usuario Demo:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

const ensureDemoUserSeeded = async () => {
  const existingConnection = mongoose.connection.readyState === 1;

  if (!existingConnection) {
    await connectDB();
  }

  try {
    await createDemoUser();
  } finally {
    if (!existingConnection) {
      await mongoose.disconnect();
    }
  }
};

if (require.main === module) {
  runCli();
}

module.exports = {
  ensureDemoUserSeeded,
};

