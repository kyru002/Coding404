const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const UserLanguageProgress = require('../models/UserLanguageProgress');

dotenv.config({ path: '.env.local' });

const LANGUAGE_TO_LESSON_MAP = {
  'HTML': { lessonId: 'frontend-html', courseName: 'Frontend' },
  'CSS': { lessonId: 'frontend-css', courseName: 'Frontend' },
  'JavaScript': { lessonId: 'frontend-js', courseName: 'Frontend' },
  'Node.js': { lessonId: 'backend-api', courseName: 'Backend' },
  'Python': { lessonId: 'python', courseName: 'Backend' },
  'SQL': { lessonId: 'database-mysql', courseName: 'Backend' },
  'Java': { lessonId: 'backend-java', courseName: 'Backend' }
};

const syncCompletedLessons = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado\n');

    // Obtener todos los usuarios
    const users = await User.find({});
    console.log(`📋 Encontrados ${users.length} usuarios\n`);

    let totalUpdated = 0;

    for (const user of users) {
      console.log(`\n👤 Procesando: ${user.username}`);
      
      if (!user.learningPath) {
        user.learningPath = {
          preferredTrack: user.programmerType,
          recommendedCourse: 'frontend',
          activeCourse: 'frontend',
          startedCourses: [],
          startedLessons: [],
          completedLessons: []
        };
      }

      if (!Array.isArray(user.learningPath.completedLessons)) {
        user.learningPath.completedLessons = [];
      }

      // Para cada lenguaje, verificar si se completaron todos los niveles
      for (const [language, lesson] of Object.entries(LANGUAGE_TO_LESSON_MAP)) {
        const progress = await UserLanguageProgress.findOne({
          userId: user._id,
          language
        });

        if (!progress) {
          console.log(`  ⚠️  No hay progreso para ${language}`);
          continue;
        }

        const completedCount = progress.completedLevels?.length || 0;
        const POINTS_PER_LEVEL = 2;
        const totalAssignedLevels = Math.floor((progress.totalPoints || 0) / POINTS_PER_LEVEL);

        console.log(`  📊 ${language}: ${completedCount}/${totalAssignedLevels} niveles`);

        // Si se completaron todos los niveles asignados
        if (completedCount >= totalAssignedLevels && completedCount > 0) {
          if (!user.learningPath.completedLessons.includes(lesson.lessonId)) {
            user.learningPath.completedLessons.push(lesson.lessonId);
            console.log(`    ✅ Marcando ${lesson.lessonId} como completado`);
            totalUpdated++;
          }
        }
      }

      // Guardar usuario si tiene cambios
      await user.save();
    }

    console.log(`\n✅ Actualización completada`);
    console.log(`📈 Total de lecciones completadas agregadas: ${totalUpdated}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

syncCompletedLessons();
