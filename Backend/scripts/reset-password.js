const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config({ path: '.env.local' });

const getRequiredEnv = (name) => {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Falta ${name} en .env.local`);
  }
  return value;
};

const setUserPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');

    const testPassword = getRequiredEnv('SEED_DEFAULT_PASSWORD');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testPassword, salt);

    const user = await User.findOneAndUpdate(
      { username: 'user_legend' },
      { passwordHash },
      { returnDocument: 'after' }
    );

    if (!user) {
      console.error('❌ Usuario no encontrado');
      process.exit(1);
    }

    console.log('✅ Contraseña actualizada para user_legend');
    console.log('  - Username:', user.username);
    console.log('  - Nueva contraseña: (definida por SEED_DEFAULT_PASSWORD)');
    
    // Verificar
    const isMatch = await bcrypt.compare(testPassword, user.passwordHash);
    console.log('  - Verificación:', isMatch ? '✓ Contraseña correcta' : '✗ Error en verificación');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setUserPassword();
