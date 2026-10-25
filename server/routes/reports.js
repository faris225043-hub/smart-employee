import express from 'express';
import {
  getEmployeeDirectoryReport,
  getDepartmentWiseReport,
  getAttendanceSummaryReport,
  exportEmployeesCsv,
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/directory', getEmployeeDirectoryReport);
router.get('/departments', getDepartmentWiseReport);
router.get('/attendance-summary', getAttendanceSummaryReport);
router.get('/export-csv', authorize('Admin', 'HR Manager'), exportEmployeesCsv);

export default router;
