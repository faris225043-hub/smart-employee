import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { validateBody } from '../middleware/validate.js';
import { employeeSchema, updateEmployeeSchema } from '../validators/schemas.js';

const router = express.Router();

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', validateBody(employeeSchema), createEmployee);
router.put('/:id', validateBody(updateEmployeeSchema), updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
