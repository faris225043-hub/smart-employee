import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

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

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps or curl) or matching clientOrigin
    if (!origin || origin === config.clientOrigin) {
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

// Base Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Smart Employee Management System API',
    documentation: '/api/health',
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Catch 404
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
