import Department from '../models/Department.js';
import Employee from '../models/Employee.js';

export const getDepartments = async (req, res, next) => {
  try {
    const { search, isActive } = req.query;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    // Aggregate with employee count
    const departments = await Department.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'department',
          as: 'employees',
        },
      },
      {
        $project: {
          name: 1,
          code: 1,
          description: 1,
          isActive: 1,
          createdAt: 1,
          updatedAt: 1,
          employeeCount: { $size: '$employees' },
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (err) {
    next(err);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    const employeeCount = await Employee.countDocuments({ department: department._id });

    res.json({
      success: true,
      data: {
        ...department.toObject(),
        employeeCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, isActive } = req.body;

    // Check duplicate name or code
    const existing = await Department.findOne({
      $or: [{ name: { $regex: `^${name.trim()}$`, $options: 'i' } }, { code: code.trim().toUpperCase() }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: existing.name.toLowerCase() === name.trim().toLowerCase()
          ? `Department with name '${name}' already exists.`
          : `Department with code '${code}' already exists.`,
      });
    }

    const department = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || '',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: {
        ...department.toObject(),
        employeeCount: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description, isActive } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Check duplicate conflicts if name or code changed
    if (name || code) {
      const conflict = await Department.findOne({
        _id: { $ne: department._id },
        $or: [
          ...(name ? [{ name: { $regex: `^${name.trim()}$`, $options: 'i' } }] : []),
          ...(code ? [{ code: code.trim().toUpperCase() }] : []),
        ],
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: 'Another department already uses this name or code.',
        });
      }
    }

    if (name !== undefined) department.name = name.trim();
    if (code !== undefined) department.code = code.trim().toUpperCase();
    if (description !== undefined) department.description = description;
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    const employeeCount = await Employee.countDocuments({ department: department._id });

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: {
        ...department.toObject(),
        employeeCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Rule: Prevent deleting a department while employees are assigned to it
    const assignedCount = await Employee.countDocuments({ department: department._id });
    if (assignedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department '${department.name}' because ${assignedCount} employee(s) are currently assigned to it. Please reassign or remove the employees first.`,
      });
    }

    await Department.findByIdAndDelete(department._id);

    res.json({
      success: true,
      message: `Department '${department.name}' deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};
