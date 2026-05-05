const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');

dotenv.config({ path: '.env.local' });

(async () => {
  try {
    const baseUrl = process.argv[2] || 'http://localhost:5000';
    const username = process.argv[3] || 'user_novato';
    const language = process.argv[4] || 'HTML';

    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ username }, { _id: 1, username: 1 }).lean();
    if (!user) throw new Error(`Usuario no encontrado: ${username}`);

    const userId = String(user._id);
    const levels = [1, 2, 3, 4, 5];

    console.log(`🧪 Roundtrip API -> user=${username}, userId=${userId}, language=${language}`);

    const putResponse = await fetch(`${baseUrl}/api/learning/progress/${userId}/${encodeURIComponent(language)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedLevels: levels, totalPoints: levels.length * 2 }),
    });

    const putData = await putResponse.json().catch(() => ({}));
    console.log('PUT status:', putResponse.status, putData?.message || '');

    const getResponse = await fetch(`${baseUrl}/api/learning/progress/${userId}/${encodeURIComponent(language)}`);
    const getData = await getResponse.json().catch(() => ({}));

    console.log('GET status:', getResponse.status);
    console.log('GET progress:', {
      language: getData?.progress?.language,
      completedLevels: getData?.progress?.completedLevels,
      totalPoints: getData?.progress?.totalPoints,
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
