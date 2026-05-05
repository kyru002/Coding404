const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config({ path: '.env.local' });

const fixAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado\n');

    const allUsers = await User.find({});
    console.log(`📋 Total de usuarios: ${allUsers.length}\n`);

    const testPassword = 'Test@1234';
    let fixed = 0;
    let ok = 0;

    for (const user of allUsers) {
      if (!user.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(testPassword, salt);
        
        await User.findByIdAndUpdate(user._id, { passwordHash });
        console.log(`✅ REPARADO: ${user.username} (${user.email})`);
        fixed++;
      } else {
        ok++;
      }
    }

    console.log(`\n✅ Resumen:`);
    console.log(`  - Usuarios reparados: ${fixed}`);
    console.log(`  - Usuarios con contraseña: ${ok}`);
    console.log(`  - Contraseña asignada: Test@1234`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixAllUsers();
