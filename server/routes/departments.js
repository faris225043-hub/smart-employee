import express from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { validateBody } from '../middleware/validate.js';
import { departmentSchema, updateDepartmentSchema } from '../validators/schemas.js';

const router = express.Router();

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', validateBody(departmentSchema), createDepartment);
router.put('/:id', validateBody(updateDepartmentSchema), updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
