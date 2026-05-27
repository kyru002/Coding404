const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const UserLanguageProgress = require('../models/UserLanguageProgress');

dotenv.config({ path: '.env.local' });

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const username = process.argv[2] || 'user_novato';
    const language = process.argv[3] || 'HTML';

    const user = await User.findOne({ username });
    if (!user) throw new Error(`Usuario no encontrado: ${username}`);

    const before = await UserLanguageProgress.findOne({ userId: user._id, language }).lean();
    console.log('ANTES:', {
      user: username,
      language,
      completedLevelsLen: before?.completedLevels?.length || 0,
      totalPoints: before?.totalPoints || 0,
    });

    const nextLevels = [1, 2, 3, 4];
    await UserLanguageProgress.findOneAndUpdate(
      { userId: user._id, language },
      {
        userId: user._id,
        language,
        completedLevels: nextLevels,
        totalPoints: nextLevels.length * 2,
        completionPercentage: Math.round((nextLevels.length / 30) * 100),
        lastActivityAt: new Date(),
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    const after = await UserLanguageProgress.findOne({ userId: user._id, language }).lean();
    console.log('DESPUÉS:', {
      user: username,
      language,
      completedLevelsLen: after?.completedLevels?.length || 0,
      totalPoints: after?.totalPoints || 0,
      levels: after?.completedLevels || [],
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
