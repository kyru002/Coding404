const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config({ path: '.env.local' });

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado\n');

    // Definir usuarios de prueba
    const testUsers = [
      { fullName: 'User Legend', username: 'user_legend', email: 'user_legend@test.com', programmerType: 'Legend' },
      { fullName: 'User Pro', username: 'user_pro', email: 'user_pro@test.com', programmerType: 'Pro' },
      { fullName: 'User Maestro', username: 'user_maestro', email: 'user_maestro@test.com', programmerType: 'Maestro' },
      { fullName: 'User Experto 1', username: 'user_experto1', email: 'user_experto1@test.com', programmerType: 'Experto' },
      { fullName: 'User Experto 2', username: 'user_experto2', email: 'user_experto2@test.com', programmerType: 'Experto' },
      { fullName: 'User Avanzado', username: 'user_avanzado', email: 'user_avanzado@test.com', programmerType: 'Avanzado' },
      { fullName: 'User Intermedio 1', username: 'user_intermedio1', email: 'user_intermedio1@test.com', programmerType: 'Intermedio' },
      { fullName: 'User Intermedio 2', username: 'user_intermedio2', email: 'user_intermedio2@test.com', programmerType: 'Intermedio' },
      { fullName: 'User Junior', username: 'user_junior', email: 'user_junior@test.com', programmerType: 'Junior' },
      { fullName: 'User Novato', username: 'user_novato', email: 'user_novato@test.com', programmerType: 'Novato' },
    ];

    const password = 'Test@1234';
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('👤 Creando usuarios de prueba...\n');

    let created = 0;
    let updated = 0;

    for (const userData of testUsers) {
      try {
        const existingUser = await User.findOne({ username: userData.username });

        if (existingUser) {
          console.log(`⏭️  ${userData.username} ya existe, omitiendo...`);
          updated++;
          continue;
        }

        const newUser = new User({
          ...userData,
          passwordHash,
          learningPath: {
            preferredTrack: '',
            recommendedCourse: 'frontend',
            activeCourse: 'frontend',
            startedCourses: ['frontend'],
            startedLessons: ['frontend-html'],
            completedLessons: [],
          },
          github: {
            hasAccount: false,
            username: '',
          },
          avatarUrl: '',
        });

        await newUser.save();
        console.log(`✅ ${userData.username} creado`);
        created++;
      } catch (error) {
        console.log(`❌ Error creando ${userData.username}: ${error.message}`);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`✅ Usuarios creados: ${created}`);
    console.log(`⏭️  Usuarios existentes: ${updated}`);
    console.log(`\n🔑 Contraseña para todos: ${password}\n`);
    console.log(`📝 Próximo paso: ejecutar 'node Backend/scripts/assign-user-points.js' para asignar puntos`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestUsers();
