const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI no está definida. Configúrala en tu archivo .env.local');
}

(async () => {
  try {
    console.log('🔄 Intentando conectar a MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Conexión exitosa a MongoDB');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    console.error('Detalles del error:', error);
  }
})();