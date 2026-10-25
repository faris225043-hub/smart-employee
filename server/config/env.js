import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory if it exists
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-jwt-secret-key-1234567890' : ''),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
};

export const validateEnv = () => {
  const missing = [];
  if (!config.mongodbUri && config.nodeEnv !== 'test') {
    missing.push('MONGODB_URI (e.g. mongodb+srv://<user>:<password>@cluster0.mongodb.net/smart_ems)');
  }
  if (!config.jwtSecret && config.nodeEnv !== 'test') {
    missing.push('JWT_SECRET (minimum 32 random characters)');
  }

  if (missing.length > 0) {
    const errorMsg = [
      '------------------------------------------------------------------',
      'Configuration Error: Missing required environment variables:',
      ...missing.map(m => ` - ${m}`),
      'Please copy .env.example to .env in the server directory and set the values.',
      '------------------------------------------------------------------',
    ].join('\n');
    throw new Error(errorMsg);
  }
};
