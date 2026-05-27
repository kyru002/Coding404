const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const UserLanguageProgress = require('../models/UserLanguageProgress');
const UserLeague = require('../models/UserLeague');

dotenv.config({ path: '.env.local' });

const POINTS_PER_LEVEL = 2;
const LEVELS_PER_LANGUAGE = 30;

// Mapear programmerType a lenguajes
const getLanguagesForType = (programmerType) => {
  const normalized = (programmerType || '').toLowerCase().trim();
  
  if (normalized.includes('front')) {
    return ['HTML', 'CSS', 'JavaScript'];
  }
  if (normalized.includes('back')) {
    return ['Node.js', 'JavaScript', 'Python'];
  }
  if (normalized.includes('base') || normalized.includes('dato')) {
    return ['SQL', 'Python'];
  }
  if (normalized.includes('full')) {
    return ['HTML', 'CSS', 'JavaScript', 'Node.js', 'SQL'];
  }
  return ['Python', 'JavaScript'];
};

const syncUserProgress = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado\n');

    const users = await User.find({});
    console.log(`📋 Total de usuarios: ${users.length}\n`);

    for (const user of users) {
      // Obtener puntos totales del usuario
      const userLeague = await UserLeague.findOne({ userId: user._id });
      const totalPoints = userLeague?.totalPoints || 0;

      // Obtener lenguajes para este tipo de programador
      const languages = getLanguagesForType(user.programmerType);

      // Calcular total de niveles completados basado en puntos
      const totalLevelsCompleted = Math.floor(totalPoints / POINTS_PER_LEVEL);

      // Distribuir niveles entre los lenguajes del usuario, respetando el máximo de 30 cada uno
      const levelsPerLanguage = Math.floor(totalLevelsCompleted / languages.length);
      const remainderLevels = totalLevelsCompleted % languages.length;

      let actualCompletedLevels = 0;
      let index = 0;

      for (const language of languages) {
        // Calcular niveles para este lenguaje
        let levelsForThisLanguage = levelsPerLanguage + (index < remainderLevels ? 1 : 0);
        
        // Capear a máximo 30 niveles
        levelsForThisLanguage = Math.min(levelsForThisLanguage, LEVELS_PER_LANGUAGE);

        let progress = await UserLanguageProgress.findOne({
          userId: user._id,
          language
        });

        if (!progress) {
          progress = new UserLanguageProgress({
            userId: user._id,
            language
          });
        }

        // Generar array de 1 a levelsForThisLanguage
        const completedLevelsArray = Array.from(
          { length: levelsForThisLanguage },
          (_, i) => i + 1
        );

        progress.completedLevels = completedLevelsArray;
        progress.totalPoints = levelsForThisLanguage * POINTS_PER_LEVEL;
        progress.completionPercentage =
          (levelsForThisLanguage / LEVELS_PER_LANGUAGE) * 100;

        await progress.save();
        actualCompletedLevels += levelsForThisLanguage;
        index++;
      }

      const levelsPerLang = Math.round(actualCompletedLevels / languages.length);
      console.log(
        `✅ ${user.username} (${totalPoints} pts): ${actualCompletedLevels} niveles (${levelsPerLang} promedio por lenguaje)`
      );
    }

    console.log(`\n✅ Sincronización completada`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

syncUserProgress();
