import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/summary', getDashboardSummary);

export default router;
