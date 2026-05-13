const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb+srv://Admin:admin123@coding404.dzsh0ed.mongodb.net/Coding404?retryWrites=true&w=majority';

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