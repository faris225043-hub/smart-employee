import express from 'express';
import {
  createLeaveRequest,
  getLeaveRequests,
  reviewLeaveRequest,
} from '../controllers/leaveController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { leaveRequestSchema, leaveReviewSchema } from '../validators/schemas.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getLeaveRequests);
router.post('/', validateBody(leaveRequestSchema), createLeaveRequest);
router.patch('/:id/review', authorize('Admin', 'HR Manager'), validateBody(leaveReviewSchema), reviewLeaveRequest);

export default router;
