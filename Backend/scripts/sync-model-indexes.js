const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local', quiet: true });

const modelsDir = path.join(__dirname, '..', 'models');

const loadModels = () => {
  const files = fs
    .readdirSync(modelsDir)
    .filter((file) => file.endsWith('.js'))
    .sort();

  for (const file of files) {
    require(path.join(modelsDir, file));
  }
};

const main = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en .env.local');
    }

    loadModels();

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    const modelNames = mongoose.modelNames().sort();

    for (const modelName of modelNames) {
      const model = mongoose.model(modelName);
      console.log(`\n== ${modelName} ==`);

      const beforeIndexes = await model.collection.indexes().catch(() => []);
      console.log(`Índices antes: ${beforeIndexes.length}`);

      const dropped = await model.syncIndexes();
      const afterIndexes = await model.collection.indexes().catch(() => []);

      console.log(`Índices eliminados por sync: ${Array.isArray(dropped) ? dropped.length : 0}`);
      console.log(`Índices después: ${afterIndexes.length}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('✗ Error sincronizando índices:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

main();