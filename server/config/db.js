import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (!config.mongodbUri) {
    throw new Error(
      'Database connection failed: MONGODB_URI is not set in environment. ' +
      'Please verify your server/.env file contains a valid MongoDB Atlas connection string.'
    );
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    console.log(`[Database] MongoDB connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    isConnected = false;
    // Log the error name and sanitized message without exposing URI credentials
    let sanitizedMessage = err.message || 'Unknown database connection error';
    if (config.mongodbUri && sanitizedMessage.includes('mongodb+srv://')) {
      sanitizedMessage = sanitizedMessage.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@');
    }
    console.error(`[Database Error] Failed to connect to MongoDB: ${sanitizedMessage}`);
    throw err;
  }
};

export const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'unknown',
    code: stateCode,
    isHealthy: stateCode === 1,
  };
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] MongoDB disconnected cleanly.');
  }
};
