import express from 'express';
import { getDbStatus } from '../config/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus = getDbStatus();
  const isHealthy = dbStatus.isHealthy;

  res.status(isHealthy ? 200 : 503).json({
    success: true,
    status: isHealthy ? 'healthy' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.state,
      connected: dbStatus.isHealthy,
    },
    version: '1.0.0',
    service: 'Smart Employee Management System API',
  });
});

export default router;
