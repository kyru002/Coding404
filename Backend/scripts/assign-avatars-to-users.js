const dotenv = require('dotenv');
const mongoose = require('mongoose');

const User = require('../models/User');

dotenv.config({ path: '.env.local' });

const avatarPool = [
  '/images/Fotos perfiles/ashford-marx-jIYKO-Ipmhk-unsplash.jpg',
  '/images/Fotos perfiles/baruk-granda-HiP7PkCB9S4-unsplash.jpg',
  '/images/Fotos perfiles/dasha-yukhymyuk-rPG1Fg8UDUw-unsplash.jpg',
  '/images/Fotos perfiles/dmytro-koplyk-UhtqDMeJS0g-unsplash.jpg',
  '/images/Fotos perfiles/harrison-lin-2OajIB8ustA-unsplash.jpg',
  '/images/Fotos perfiles/hombre.png',
  '/images/Fotos perfiles/jc-gellidon-xDsq3u3ZUqc-unsplash.jpg',
  '/images/Fotos perfiles/microsoft-copilot-71ig274jGpw-unsplash.jpg',
  '/images/Fotos perfiles/microsoft-copilot-SQVABUT4DoM-unsplash.jpg',
  '/images/Fotos perfiles/praise-judah-P4BYzznXED8-unsplash.jpg',
  '/images/Fotos perfiles/sam-roy-muK9xbpdKcw-unsplash.jpg',
  '/images/Fotos perfiles/tanya-prodaan-b0oV0J7IEfs-unsplash.jpg',
  '/images/Fotos perfiles/toxic-smoker-Alb_0oSV3x4-unsplash.jpg',
  '/images/Fotos perfiles/viktor-forgacs-click-QDMEADvb4PE-unsplash.jpg',
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const usersWithoutAvatar = await User.find(
      {
        role: { $ne: 'admin' },
        isBanned: { $ne: true },
        $or: [
          { avatarUrl: { $exists: false } },
          { avatarUrl: '' },
          { avatarUrl: null },
        ],
      },
      { _id: 1, username: 1 }
    )
      .sort({ username: 1 })
      .limit(avatarPool.length)
      .lean();

    if (usersWithoutAvatar.length === 0) {
      console.log('No hay usuarios sin avatar para actualizar.');
      process.exit(0);
    }

    const updates = usersWithoutAvatar.map((user, index) => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { avatarUrl: avatarPool[index] } },
      },
    }));

    await User.bulkWrite(updates, { ordered: true });

    console.log(`Usuarios actualizados con avatar: ${usersWithoutAvatar.length}`);
    console.log('Asignaciones:');
    usersWithoutAvatar.forEach((user, index) => {
      console.log(`- ${user.username} => ${avatarPool[index]}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error asignando avatares:', error.message);
    process.exit(1);
  }
}

run();
