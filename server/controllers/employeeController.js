import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';

// Helper to generate next unique Employee ID
const generateEmployeeId = async () => {
  const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });
  if (!lastEmployee || !lastEmployee.employeeId) {
    return 'EMP-1001';
  }
  const match = lastEmployee.employeeId.match(/\d+$/);
  if (!match) {
    return `EMP-${Date.now().toString().slice(-4)}`;
  }
  const nextNumber = parseInt(match[0], 10) + 1;
  return `EMP-${nextNumber.toString().padStart(4, '0')}`;
};

export const getEmployees = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department,
      status,
      employmentType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    // Search by name, employeeId, or email
    if (search.trim()) {
      const term = search.trim();
      filter.$or = [
        { employeeId: { $regex: term, $options: 'i' } },
        { firstName: { $regex: term, $options: 'i' } },
        { lastName: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { jobTitle: { $regex: term, $options: 'i' } },
      ];
    }

    // Filter by department
    if (department) {
      filter.department = department;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by employment type
    if (employmentType) {
      filter.employmentType = employmentType;
    }

    // Sort order
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Role-based field restrictions: Hide salary from non-privileged roles if user exists
    const isPrivileged = !req.user || ['Admin', 'HR Manager'].includes(req.user.role);
    const projection = isPrivileged ? {} : { salary: 0 };

    const [totalRecords, employees] = await Promise.all([
      Employee.countDocuments(filter),
      Employee.find(filter, projection)
        .populate('department', 'name code')
        .populate('manager', 'firstName lastName employeeId')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalRecords / limitNum);

    res.json({
      success: true,
      data: employees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const isPrivileged = !req.user || ['Admin', 'HR Manager'].includes(req.user.role);
    const projection = isPrivileged ? {} : { salary: 0 };

    const employee = await Employee.findById(req.params.id, projection)
      .populate('department', 'name code description')
      .populate('manager', 'firstName lastName employeeId email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // Verify department exists
    const department = await Department.findById(data.department);
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'The selected department does not exist.',
      });
    }

    // Check duplicate email
    const existingEmail = await Employee.findOne({ email: data.email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: `An employee with email '${data.email}' already exists.`,
      });
    }

    // Auto-generate employeeId if not provided or check uniqueness if provided
    if (!data.employeeId) {
      data.employeeId = await generateEmployeeId();
    } else {
      const existingId = await Employee.findOne({ employeeId: data.employeeId.toUpperCase() });
      if (existingId) {
        return res.status(409).json({
          success: false,
          message: `Employee ID '${data.employeeId}' is already in use.`,
        });
      }
      data.employeeId = data.employeeId.toUpperCase();
    }

    // Verify manager if provided
    if (data.manager) {
      const manager = await Employee.findById(data.manager);
      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'The selected manager does not exist.',
        });
      }
    }

    const employee = await Employee.create(data);
    const populated = await Employee.findById(employee._id)
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName employeeId');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const data = { ...req.body };

    // Prevent assigning oneself as manager
    if (data.manager && data.manager.toString() === employee._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'An employee cannot be their own manager.',
      });
    }

    // If department updated, verify existence
    if (data.department) {
      const department = await Department.findById(data.department);
      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'The selected department does not exist.',
        });
      }
    }

    // If email updated, verify duplicate
    if (data.email && data.email.toLowerCase() !== employee.email) {
      const existingEmail = await Employee.findOne({
        _id: { $ne: employee._id },
        email: data.email.toLowerCase(),
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: `Email '${data.email}' is already taken by another employee.`,
        });
      }
    }

    // If employeeId updated, verify duplicate
    if (data.employeeId && data.employeeId.toUpperCase() !== employee.employeeId) {
      const existingId = await Employee.findOne({
        _id: { $ne: employee._id },
        employeeId: data.employeeId.toUpperCase(),
      });
      if (existingId) {
        return res.status(409).json({
          success: false,
          message: `Employee ID '${data.employeeId}' is already in use.`,
        });
      }
      data.employeeId = data.employeeId.toUpperCase();
    }

    // Update fields
    Object.assign(employee, data);
    await employee.save();

    const populated = await Employee.findById(employee._id)
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName employeeId');

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Clear manager reference on subordinates if any
    await Employee.updateMany({ manager: employee._id }, { $set: { manager: null } });

    // Clean up or cascade attendance and leave records
    await Promise.all([
      Attendance.deleteMany({ employee: employee._id }),
      LeaveRequest.deleteMany({ employee: employee._id }),
      Employee.findByIdAndDelete(employee._id),
    ]);

    res.json({
      success: true,
      message: `Employee ${employee.firstName} ${employee.lastName} (${employee.employeeId}) and associated records have been removed.`,
    });
  } catch (err) {
    next(err);
  }
};
