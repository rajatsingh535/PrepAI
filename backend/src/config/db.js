const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,   // Fail fast if Atlas unreachable
      socketTimeoutMS: 30000,
      bufferCommands: false,            // Don't buffer – throw immediately if disconnected
    });
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    if (error.message.includes('whitelist') || error.message.includes('IP')) {
      logger.error(`🔒 FIX: Whitelist your IP (49.156.100.27) in MongoDB Atlas → Network Access`);
    }
    logger.warn('⚠️ Server continuing without MongoDB. Auth/session features will be disabled.');
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('✅ MongoDB reconnected');
});

module.exports = connectDB;
