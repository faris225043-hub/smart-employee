import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, getCurrentUser, createUserByAdmin } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema, registerUserSchema } from '../validators/schemas.js';

const router = express.Router();

// Rate limiter for authentication endpoints: max 15 attempts per 15 minutes in non-test mode
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 15,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

// Admin-only user creation endpoint
router.post('/users', authenticate, authorize('Admin'), validateBody(registerUserSchema), createUserByAdmin);

export default router;
