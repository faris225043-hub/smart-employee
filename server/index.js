import app from './app.js';
import { config, validateEnv } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

const startServer = async () => {
  try {
    // Validate configuration
    validateEnv();

    // Connect to database
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(`[Server] Smart EMS API is running on http://localhost:${config.port}`);
      console.log(`[Server] Environment: ${config.nodeEnv}`);
      console.log(`[Server] Health check: http://localhost:${config.port}/api/health`);
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Process terminated cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[Server Error] Startup failed:', err.message);
    process.exit(1);
  }
};

startServer();
