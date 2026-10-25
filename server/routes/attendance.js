import express from 'express';
import {
  recordAttendance,
  getAttendanceRecords,
  updateAttendance,
} from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { attendanceRecordSchema } from '../validators/schemas.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAttendanceRecords);
router.post('/', authorize('Admin', 'HR Manager'), validateBody(attendanceRecordSchema), recordAttendance);
router.put('/:id', authorize('Admin', 'HR Manager'), updateAttendance);

export default router;
