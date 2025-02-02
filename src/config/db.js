const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ MongoDB Connected Successfully');
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};
mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB Disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Error:', err);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('✅ MongoDB Connection Closed');
  process.exit(0);
});

module.exports = connectDB;