const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const UserLanguageProgress = require('../models/UserLanguageProgress');
const UserLeague = require('../models/UserLeague');
const League = require('../models/League');

dotenv.config({ path: '.env.local' });

const LEVELS_PER_LANGUAGE = 30;
const POINTS_PER_LEVEL = 2;

const LANGUAGE_ALIASES = {
  MYSQL: 'SQL',
};

const normalizeLanguage = (language = '') => {
  const value = String(language).trim();
  const alias = LANGUAGE_ALIASES[value.toUpperCase()];
  return alias || value;
};

const getLeagueName = (points) => {
  if (points >= 1000) return 'Legendary Lead';
  if (points >= 800) return 'Tech Architect';
  if (points >= 600) return 'Software Engineer';
  if (points >= 400) return 'Stack Crafter';
  if (points >= 200) return 'Code Builder';
  return 'Junior Explorer';
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado\n');

    const courseLanguages = await Course.distinct('language');
    const supportedLanguages = new Set(courseLanguages.map((item) => normalizeLanguage(item)).filter(Boolean));

    const allProgress = await UserLanguageProgress.find({}).lean();
    let deleted = 0;
    let normalized = 0;
    let recalculated = 0;

    for (const progress of allProgress) {
      const currentLanguage = String(progress.language || '').trim();
      const normalizedLanguage = normalizeLanguage(currentLanguage);

      if (!supportedLanguages.has(normalizedLanguage)) {
        await UserLanguageProgress.deleteOne({ _id: progress._id });
        deleted += 1;
        continue;
      }

      const completedLevels = Array.isArray(progress.completedLevels)
        ? [...new Set(progress.completedLevels.map((v) => Number(v)).filter((v) => Number.isInteger(v) && v > 0))].sort((a, b) => a - b).slice(0, LEVELS_PER_LANGUAGE)
        : [];

      const totalPoints = completedLevels.length * POINTS_PER_LEVEL;
      const completionPercentage = Math.min(100, Math.round((completedLevels.length / LEVELS_PER_LANGUAGE) * 100));
      const completedAt = completedLevels.length >= LEVELS_PER_LANGUAGE ? (progress.completedAt || new Date()) : null;

      const languageChanged = currentLanguage !== normalizedLanguage;
      const pointsChanged = Number(progress.totalPoints || 0) !== totalPoints;
      const completedChanged = JSON.stringify(progress.completedLevels || []) !== JSON.stringify(completedLevels);

      if (languageChanged || pointsChanged || completedChanged) {
        await UserLanguageProgress.updateOne(
          { _id: progress._id },
          {
            $set: {
              language: normalizedLanguage,
              completedLevels,
              totalPoints,
              completionPercentage,
              completedAt,
              lastActivityAt: progress.lastActivityAt || new Date(),
            },
          }
        );

        if (languageChanged) normalized += 1;
        if (pointsChanged || completedChanged) recalculated += 1;
      }
    }

    const usersWithProgress = await UserLanguageProgress.aggregate([
      { $group: { _id: '$userId', totalPoints: { $sum: '$totalPoints' } } },
    ]);

    const leaguesByName = await League.find({}, { name: 1 }).lean();
    const leagueMap = new Map(leaguesByName.map((l) => [l.name, l._id]));

    let leaguesUpdated = 0;
    for (const userTotal of usersWithProgress) {
      const leagueName = getLeagueName(Number(userTotal.totalPoints || 0));
      const leagueId = leagueMap.get(leagueName);
      if (!leagueId) continue;

      await UserLeague.findOneAndUpdate(
        { userId: userTotal._id },
        {
          userId: userTotal._id,
          leagueId,
          totalPoints: Number(userTotal.totalPoints || 0),
          updatedAtLeague: new Date(),
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      leaguesUpdated += 1;
    }

    console.log('🧹 Normalización completada:');
    console.log(`- Progresos eliminados (lenguaje inválido): ${deleted}`);
    console.log(`- Lenguajes normalizados: ${normalized}`);
    console.log(`- Puntos/completados recalculados: ${recalculated}`);
    console.log(`- UserLeague sincronizados: ${leaguesUpdated}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
