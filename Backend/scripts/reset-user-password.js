const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config({ path: '.env.local' });

const run = async () => {
  const username = process.argv[2];
  const newPassword = process.argv[3];

  if (!username || !newPassword) {
    console.error('Uso: node reset-user-password.js <username> <newPassword>');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const user = await User.findOneAndUpdate(
      { username },
      { passwordHash },
      { returnDocument: 'after' }
    );

    if (!user) {
      console.error('❌ Usuario no encontrado:', username);
      process.exit(1);
    }

    console.log('✅ Contraseña actualizada');
    console.log('  - Username:', user.username);
    console.log('  - Nueva contraseña:', newPassword);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
