const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const UserLanguageProgress = require('../models/UserLanguageProgress');
const UserLeague = require('../models/UserLeague');

dotenv.config({ path: '.env.local' });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📚 Colecciones:');
    collections.forEach((c) => console.log(`- ${c.name}`));

    const progressIndexes = await UserLanguageProgress.collection.indexes();
    console.log('\n🧱 Índices userlanguageprogress:');
    progressIndexes.forEach((idx) => console.log(`- ${idx.name}: ${JSON.stringify(idx.key)} unique=${Boolean(idx.unique)}`));

    const duplicatePairs = await UserLanguageProgress.aggregate([
      {
        $group: {
          _id: { userId: '$userId', language: '$language' },
          count: { $sum: 1 },
          ids: { $push: '$_id' },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    console.log(`\n🔎 Duplicados userId+language: ${duplicatePairs.length}`);
    if (duplicatePairs.length > 0) {
      duplicatePairs.slice(0, 10).forEach((d) => {
        console.log(`- userId=${d._id.userId} language=${d._id.language} docs=${d.count}`);
      });
    }

    const usersCount = await User.countDocuments();
    const progressCount = await UserLanguageProgress.countDocuments();
    const leagueCount = await UserLeague.countDocuments();
    console.log(`\n📊 Totales: users=${usersCount}, progress=${progressCount}, userleague=${leagueCount}`);

    const targetUsers = await User.find(
      { username: { $in: ['user_legend', 'user_pro', 'user_maestro', 'user_experto1', 'user_experto2', 'user_avanzado', 'user_intermedio1', 'user_intermedio2', 'user_junior', 'user_novato'] } },
      { username: 1 }
    ).lean();

    console.log('\n👥 Progreso por usuarios de prueba:');
    for (const u of targetUsers) {
      const progress = await UserLanguageProgress.find({ userId: u._id }, { language: 1, totalPoints: 1, completedLevels: 1 }).lean();
      const sum = progress.reduce((acc, p) => acc + Number(p.totalPoints || 0), 0);
      const league = await UserLeague.findOne({ userId: u._id }, { totalPoints: 1 }).lean();
      console.log(`- ${u.username}: progressDocs=${progress.length}, sumProgress=${sum}, userLeague=${league?.totalPoints ?? 'N/A'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

run();
