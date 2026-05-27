const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const UserLanguageProgress = require('../models/UserLanguageProgress');
const UserLeague = require('../models/UserLeague');

dotenv.config({ path: '.env.local' });

const normalizeLevels = (levels = [], maxLevels = 30) => {
  if (!Array.isArray(levels)) return [];
  const normalized = [...new Set(levels
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0)
  )].sort((a, b) => a - b);

  return normalized.slice(0, maxLevels);
};

const resolveSourceUser = async (targetUserId, explicitSourceUsername) => {
  if (explicitSourceUsername) {
    const sourceUser = await User.findOne({ username: explicitSourceUsername });
    if (!sourceUser) {
      throw new Error(`Usuario origen no encontrado: ${explicitSourceUsername}`);
    }
    if (String(sourceUser._id) === String(targetUserId)) {
      throw new Error('El usuario origen no puede ser el mismo que el destino.');
    }
    return sourceUser;
  }

  const htmlProgressDocs = await UserLanguageProgress.find({
    language: 'HTML',
    userId: { $ne: targetUserId },
  }).lean();

  if (!htmlProgressDocs.length) {
    throw new Error('No se encontró progreso HTML para seleccionar un usuario origen automáticamente.');
  }

  htmlProgressDocs.sort((a, b) => {
    const aCount = Array.isArray(a.completedLevels) ? a.completedLevels.length : 0;
    const bCount = Array.isArray(b.completedLevels) ? b.completedLevels.length : 0;
    return bCount - aCount;
  });

  const bestSource = htmlProgressDocs[0];
  const sourceUser = await User.findById(bestSource.userId);
  if (!sourceUser) {
    throw new Error('No se pudo resolver el usuario origen automático.');
  }

  return sourceUser;
};

const migrateProgress = async () => {
  const targetUsername = process.argv[2] || 'kyru002';
  const sourceUsername = process.argv[3] || '';

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) {
      throw new Error(`Usuario destino no encontrado: ${targetUsername}`);
    }

    const sourceUser = await resolveSourceUser(targetUser._id, sourceUsername);

    const sourceProgressDocs = await UserLanguageProgress.find({ userId: sourceUser._id }).lean();
    if (!sourceProgressDocs.length) {
      throw new Error(`El usuario origen (${sourceUser.username}) no tiene progreso para migrar.`);
    }

    const migrated = [];

    for (const sourceDoc of sourceProgressDocs) {
      const sourceLevels = normalizeLevels(sourceDoc.completedLevels);

      const targetExisting = await UserLanguageProgress.findOne({
        userId: targetUser._id,
        language: sourceDoc.language,
      }).lean();

      const targetLevels = normalizeLevels(targetExisting?.completedLevels || []);
      const mergedLevels = normalizeLevels([...targetLevels, ...sourceLevels]);
      const totalPoints = mergedLevels.length * 2;
      const completionPercentage = Math.min(100, Math.round((mergedLevels.length / 30) * 100));

      await UserLanguageProgress.findOneAndUpdate(
        { userId: targetUser._id, language: sourceDoc.language },
        {
          userId: targetUser._id,
          language: sourceDoc.language,
          completedLevels: mergedLevels,
          totalPoints,
          completionPercentage,
          completedAt: mergedLevels.length >= 30 ? new Date() : null,
          lastActivityAt: new Date(),
        },
        { upsert: true }
      );

      migrated.push({
        language: sourceDoc.language,
        sourceLevels: sourceLevels.length,
        targetLevelsBefore: targetLevels.length,
        targetLevelsAfter: mergedLevels.length,
      });
    }

    const updatedProgress = await UserLanguageProgress.find({ userId: targetUser._id }).lean();
    const totalUserPoints = updatedProgress.reduce((sum, item) => sum + Number(item.totalPoints || 0), 0);

    await UserLeague.findOneAndUpdate(
      { userId: targetUser._id },
      {
        userId: targetUser._id,
        totalPoints: totalUserPoints,
        updatedAtLeague: new Date(),
      },
      { upsert: true }
    );

    console.log('✅ Migración completada');
    console.log(`Destino: ${targetUser.username}`);
    console.log(`Origen: ${sourceUser.username}`);
    console.log(`Puntos totales destino: ${totalUserPoints}`);
    console.table(migrated);
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

migrateProgress();
