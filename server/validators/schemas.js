import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().trim().min(2, 'Department name must be at least 2 characters').max(80),
  code: z.string().trim().min(2, 'Code must be at least 2 characters').max(10).toUpperCase(),
  description: z.string().trim().max(500).optional().default(''),
  isActive: z.boolean().optional().default(true),
});

export const updateDepartmentSchema = departmentSchema.partial();

export const employeeSchema = z.object({
  employeeId: z.string().trim().min(3, 'Employee ID must be at least 3 characters').optional(),
  firstName: z.string().trim().min(1, 'First name is required').max(60),
  lastName: z.string().trim().min(1, 'Last name is required').max(60),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  phone: z.string().trim().max(20).optional().default(''),
  department: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid department ID'),
  jobTitle: z.string().trim().min(1, 'Job title is required').max(100),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern'], {
    errorMap: () => ({ message: 'Employment type must be Full-time, Part-time, Contract, or Intern' }),
  }),
  joiningDate: z.string().or(z.date()).refine(val => !isNaN(new Date(val).getTime()), {
    message: 'Invalid joining date',
  }),
  status: z.enum(['Active', 'Inactive', 'On Leave']).optional().default('Active'),
  salary: z.number().min(0, 'Salary must be a positive number').nullable().optional(),
  manager: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid manager ID').nullable().optional(),
  profileImage: z.string().url('Invalid image URL').or(z.literal('')).optional().default(''),
});

export const updateEmployeeSchema = employeeSchema.partial();

export const loginSchema = z.object({
  email: z.string().trim().email('Valid email is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const registerUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Valid email is required').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'HR Manager', 'Employee']).default('Employee'),
  employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID').nullable().optional(),
});

export const attendanceRecordSchema = z.object({
  employee: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID'),
  date: z.string().refine(val => !isNaN(new Date(val).getTime()), 'Invalid date format'),
  status: z.enum(['Present', 'Absent', 'Late', 'On Leave']),
  checkInTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:mm').nullable().optional(),
  checkOutTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:mm').nullable().optional(),
  workHours: z.number().min(0).max(24).optional().default(0),
  remarks: z.string().max(300).optional().default(''),
});

export const leaveRequestSchema = z.object({
  employee: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID').optional(),
  leaveType: z.enum(['Annual', 'Sick', 'Casual', 'Maternity', 'Paternity', 'Unpaid']),
  startDate: z.string().refine(val => !isNaN(new Date(val).getTime()), 'Invalid start date'),
  endDate: z.string().refine(val => !isNaN(new Date(val).getTime()), 'Invalid end date'),
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters').max(1000),
});

export const leaveReviewSchema = z.object({
  status: z.enum(['Approved', 'Rejected'], {
    errorMap: () => ({ message: 'Status must be either Approved or Rejected' }),
  }),
  reviewNotes: z.string().trim().max(500).optional().default(''),
});
