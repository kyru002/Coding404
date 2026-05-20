const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local', quiet: true });

const isSystemCollection = (name) => name.startsWith('system.');

const main = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const targetCollections = collections.filter((collection) => !isSystemCollection(collection.name));

    if (targetCollections.length === 0) {
      console.log('No hay colecciones para revisar.');
      process.exit(0);
    }

    const dropped = [];
    const kept = [];

    for (const collection of targetCollections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();

      if (count === 0) {
        await mongoose.connection.db.collection(collection.name).drop();
        dropped.push(collection.name);
        console.log(`🗑️  Eliminada colección vacía: ${collection.name}`);
        continue;
      }

      kept.push({ name: collection.name, count });
      console.log(`✓ Conservada: ${collection.name} (${count} documentos)`);
    }

    console.log('\nResumen:');
    console.log(`  - Colecciones eliminadas: ${dropped.length}`);
    console.log(`  - Colecciones conservadas: ${kept.length}`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Error limpiando colecciones vacías:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

main();