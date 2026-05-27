const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const UserLanguageProgress = require('../models/UserLanguageProgress');

dotenv.config({ path: '.env.local' });

const POINTS_PER_LEVEL = 2;
const LEVELS_PER_LANGUAGE = 30;

// Mapear programmerType a lenguajes (debe coincidir con la lógica del resto del backend)
const getLanguagesForType = (programmerType) => {
  const normalized = (programmerType || '').toLowerCase().trim();

  if (normalized.includes('front')) {
    return ['HTML', 'CSS', 'JavaScript'];
  }

  if (normalized.includes('back')) {
    return ['Node.js', 'JavaScript', 'Python'];
  }

  if (normalized.includes('base') || normalized.includes('dato') || normalized.includes('database')) {
    return ['SQL', 'Python'];
  }

  if (normalized.includes('full')) {
    return ['HTML', 'CSS', 'JavaScript', 'Node.js', 'SQL'];
  }

  return ['Python', 'JavaScript'];
};

const assignUserPoints = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado\n');

    // Definir puntos totales para cada usuario (se distribuyen entre lenguajes)
    const userPoints = {
      user_legend: 5800,
      user_pro: 4200,
      user_maestro: 3500,
      user_experto1: 2450,
      user_experto2: 2200,
      user_avanzado: 1500,
      user_intermedio1: 920,
      user_intermedio2: 850,
      user_junior: 450,
      user_novato: 150,
    };

    console.log('📊 Asignando puntos a usuarios...\n');

    for (const [username, totalUserPoints] of Object.entries(userPoints)) {
      const user = await User.findOne({ username });

      if (!user) {
        console.log(`❌ Usuario ${username} no encontrado`);
        continue;
      }

      const languages = getLanguagesForType(user.programmerType);
      if (!Array.isArray(languages) || languages.length === 0) {
        console.log(`⚠️ ${username}: no se pudieron mapear lenguajes desde programmerType=${user.programmerType}`);
        continue;
      }

      const totalLevelsCompleted = Math.max(0, Math.floor(totalUserPoints / POINTS_PER_LEVEL));
      const totalCap = languages.length * LEVELS_PER_LANGUAGE;
      const totalLevelsCapped = Math.min(totalLevelsCompleted, totalCap);

      const basePerLang = Math.floor(totalLevelsCapped / languages.length);
      let remainder = totalLevelsCapped % languages.length;

      for (let langIndex = 0; langIndex < languages.length; langIndex++) {
        const levelsForThisLanguage = Math.min(
          LEVELS_PER_LANGUAGE,
          basePerLang + (remainder > 0 ? 1 : 0),
        );

        if (remainder > 0) remainder -= 1;

        const completedLevels = Array.from(
          { length: levelsForThisLanguage },
          (_, i) => i + 1, // 1-indexed (coincide con el frontend y con sanitizeLevels)
        );

        const completionPercentage = Math.round((levelsForThisLanguage / LEVELS_PER_LANGUAGE) * 100);
        const totalPoints = levelsForThisLanguage * POINTS_PER_LEVEL;

        await UserLanguageProgress.findOneAndUpdate(
          { userId: user._id, language: languages[langIndex] },
          {
            userId: user._id,
            language: languages[langIndex],
            completedLevels,
            completionPercentage,
            totalPoints,
            lastActivityAt: new Date(),
          },
          { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
        );
      }

      console.log(`✅ ${username}: ${totalUserPoints} pts -> ${totalLevelsCapped} niveles distribuidos en ${languages.length} lenguajes`);
    }

    console.log(`\n✅ Todos los puntos han sido asignados`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

assignUserPoints();
