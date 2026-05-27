const dotenv = require('dotenv');
const mongoose = require('mongoose');
const UserLanguageProgress = require('../models/UserLanguageProgress');

dotenv.config({ path: '.env.local' });

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await UserLanguageProgress.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]);

    console.log('📚 Valores language en userlanguageprogresses:');
    result.forEach((row) => {
      console.log(`- ${row._id}: ${row.count}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
