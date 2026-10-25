import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../client/dist');

// Route imports
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import departmentRoutes from './routes/departments.js';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leaves.js';
import dashboardRoutes from './routes/dashboard.js';
import reportRoutes from './routes/reports.js';

const app = express();

// Security Headers (relaxed cross-origin resource policy for static assets)
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. same-origin, curl) or matching configured origin or in production
    if (!origin || origin === config.clientOrigin || config.nodeEnv === 'production') {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body & Cookie Parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Mount API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// If client build exists (production single-service deployment), serve client assets
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // Fallback API welcome route
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to Smart Employee Management System API',
      documentation: '/api/health',
      version: '1.0.0',
    });
  });
}

// Catch 404
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
