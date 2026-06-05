/**
 * Script: completeDemoUser.js
 * Objetivo: Dar al usuario Demo todos los niveles completados en todos los lenguajes
 *           y todas las lecciones del catálogo desbloqueadas.
 *
 * Uso: node scripts/completeDemoUser.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const User = require('../models/User');
const UserLanguageProgress = require('../models/UserLanguageProgress');
const League = require('../models/League');
const UserLeague = require('../models/UserLeague');

const DEMO_USERNAME = 'demo';

// Todos los lenguajes del sistema (los mismos que en complete-all-courses)
const ALL_LANGUAGES = ['Python', 'JavaScript', 'HTML', 'CSS', 'Java', 'SQL', 'Vue', 'PHP', 'Node.js'];

// Todos los IDs de lecciones del courseCatalog en Lecciones.vue
const ALL_LESSON_IDS = [
  // Curso Python
  'python',
  // Curso Frontend
  'frontend-html',
  'frontend-css',
  'frontend-js',
  'frontend-layout',
  // Curso Backend
  'backend-java',
  'backend-poo',
  'backend-api',
  // Curso Database
  'database-mysql',
  'database-python',
  // Curso Fullstack
  'fullstack-html',
  'fullstack-css',
  'fullstack-js',
  'fullstack-vue',
  'fullstack-java',
  'fullstack-api',
  'fullstack-mysql',
];

// Todos los cursos del catálogo
const ALL_COURSE_IDS = ['python', 'frontend', 'backend', 'database', 'fullstack'];

const LEVELS_PER_LANGUAGE = 30;
const POINTS_PER_LEVEL = 2;

const leagueSeed = [
  { order: 1, name: 'Junior Explorer', minPoints: 0, maxPoints: 199, image: '/images/1.png' },
  { order: 2, name: 'Code Builder', minPoints: 200, maxPoints: 399, image: '/images/2.png' },
  { order: 3, name: 'Stack Crafter', minPoints: 400, maxPoints: 599, image: '/images/3.png' },
  { order: 4, name: 'Software Engineer', minPoints: 600, maxPoints: 799, image: '/images/4.png' },
  { order: 5, name: 'Tech Architect', minPoints: 800, maxPoints: 999, image: '/images/5.png' },
  { order: 6, name: 'Legendary Lead', minPoints: 1000, maxPoints: null, image: '/images/6.png' },
];

const getLeague = (points) => {
  if (points >= 1000) return { key: 'legendary-lead', name: 'Legendary Lead' };
  if (points >= 800) return { key: 'tech-architect', name: 'Tech Architect' };
  if (points >= 600) return { key: 'software-engineer', name: 'Software Engineer' };
  if (points >= 400) return { key: 'stack-crafter', name: 'Stack Crafter' };
  if (points >= 200) return { key: 'code-builder', name: 'Code Builder' };
  return { key: 'junior-explorer', name: 'Junior Explorer' };
};

async function ensureLeaguesSeeded() {
  const count = await League.countDocuments();
  if (count === 0) {
    await League.insertMany(leagueSeed);
    console.log('  ✅ Ligas creadas en BD');
  }
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI no encontrado en .env.local');
    process.exit(1);
  }

  console.log('🔌 Conectando a MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Conectado\n');

  // 1. Buscar usuario Demo
  const user = await User.findOne({ username: DEMO_USERNAME });
  if (!user) {
    console.error(`❌ Usuario "${DEMO_USERNAME}" no encontrado en la base de datos.`);
    process.exit(1);
  }

  const userId = String(user._id);
  console.log(`👤 Usuario encontrado: ${user.username} (${userId})\n`);

  // 2. Actualizar UserLanguageProgress: 30 niveles completados por lenguaje
  const allCompletedLevels = Array.from({ length: LEVELS_PER_LANGUAGE }, (_, i) => i + 1);
  const pointsPerLanguage = LEVELS_PER_LANGUAGE * POINTS_PER_LEVEL;

  console.log(`📚 Actualizando progreso de niveles (30 niveles x ${ALL_LANGUAGES.length} lenguajes)...`);
  for (const language of ALL_LANGUAGES) {
    await UserLanguageProgress.findOneAndUpdate(
      { userId, language },
      {
        userId,
        language,
        completedLevels: allCompletedLevels,
        completionPercentage: 100,
        totalPoints: pointsPerLanguage,
        completedAt: new Date(),
        lastActivityAt: new Date(),
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      }
    );
    console.log(`  ✅ ${language}: 30/30 niveles completados`);
  }

  // 3. Calcular puntos totales
  const totalUserPoints = pointsPerLanguage * ALL_LANGUAGES.length;
  console.log(`\n💰 Puntos totales: ${totalUserPoints}`);

  // 4. Actualizar liga
  await ensureLeaguesSeeded();
  const leagueInfo = getLeague(totalUserPoints);
  const leagueRecord = await League.findOne({ name: leagueInfo.name });
  if (leagueRecord) {
    await UserLeague.findOneAndUpdate(
      { userId },
      {
        userId,
        leagueId: leagueRecord._id,
        totalPoints: totalUserPoints,
        updatedAtLeague: new Date(),
      },
      { upsert: true }
    );
    console.log(`🏆 Liga asignada: ${leagueInfo.name}`);
  }

  // 5. Actualizar learningPath del usuario: todas las lecciones y cursos
  user.learningPath = {
    preferredTrack: 'Full-Stack',
    recommendedCourse: 'fullstack',
    activeCourse: 'fullstack',
    startedCourses: ALL_COURSE_IDS,
    startedLessons: ALL_LESSON_IDS,
    completedLessons: ALL_LESSON_IDS,
  };

  await user.save();
  console.log(`\n📖 learningPath actualizado:`);
  console.log(`  - Cursos iniciados: ${ALL_COURSE_IDS.join(', ')}`);
  console.log(`  - Lecciones completadas: ${ALL_LESSON_IDS.length} lecciones`);
  ALL_LESSON_IDS.forEach(id => console.log(`    ✅ ${id}`));

  console.log('\n🎉 ¡Usuario Demo actualizado correctamente!');
  console.log(`   Username: ${user.username}`);
  console.log(`   Lenguajes: ${ALL_LANGUAGES.length} (30 niveles cada uno)`);
  console.log(`   Lecciones: ${ALL_LESSON_IDS.length} completadas`);
  console.log(`   Puntos: ${totalUserPoints}`);
  console.log(`   Liga: ${leagueInfo.name}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
