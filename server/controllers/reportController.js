import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';

export const getEmployeeDirectoryReport = async (req, res, next) => {
  try {
    const { department, status, employmentType } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (employmentType) filter.employmentType = employmentType;

    const isPrivileged = !req.user || ['Admin', 'HR Manager'].includes(req.user.role);
    const projection = isPrivileged ? {} : { salary: 0 };

    const employees = await Employee.find(filter, projection)
      .populate('department', 'name code')
      .sort({ lastName: 1, firstName: 1 })
      .lean();

    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (err) {
    next(err);
  }
};

export const getDepartmentWiseReport = async (req, res, next) => {
  try {
    const report = await Department.aggregate([
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
          totalEmployees: { $size: '$employees' },
          activeEmployees: {
            $size: {
              $filter: {
                input: '$employees',
                as: 'emp',
                cond: { $eq: ['$$emp.status', 'Active'] },
              },
            },
          },
          onLeaveEmployees: {
            $size: {
              $filter: {
                input: '$employees',
                as: 'emp',
                cond: { $eq: ['$$emp.status', 'On Leave'] },
              },
            },
          },
          inactiveEmployees: {
            $size: {
              $filter: {
                input: '$employees',
                as: 'emp',
                cond: { $eq: ['$$emp.status', 'Inactive'] },
              },
            },
          },
        },
      },
      { $sort: { totalEmployees: -1 } },
    ]);

    res.json({
      success: true,
      count: report.length,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

export const getAttendanceSummaryReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const summary = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: '$workHours' },
          avgHours: { $avg: '$workHours' },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          totalHours: { $round: ['$totalHours', 1] },
          avgHours: { $round: ['$avgHours', 1] },
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
};

export const exportEmployeesCsv = async (req, res, next) => {
  try {
    const isPrivileged = !req.user || ['Admin', 'HR Manager'].includes(req.user.role);
    const { department, status } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;

    const employees = await Employee.find(filter)
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName')
      .sort({ employeeId: 1 })
      .lean();

    // Prepare CSV header
    const headers = [
      'Employee ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Department',
      'Job Title',
      'Employment Type',
      'Status',
      'Joining Date',
      ...(isPrivileged ? ['Salary'] : []),
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = employees.map((emp) => {
      const row = [
        escapeCsv(emp.employeeId),
        escapeCsv(emp.firstName),
        escapeCsv(emp.lastName),
        escapeCsv(emp.email),
        escapeCsv(emp.phone),
        escapeCsv(emp.department ? emp.department.name : 'N/A'),
        escapeCsv(emp.jobTitle),
        escapeCsv(emp.employmentType),
        escapeCsv(emp.status),
        escapeCsv(emp.joiningDate ? new Date(emp.joiningDate).toISOString().slice(0, 10) : ''),
      ];
      if (isPrivileged) {
        row.push(escapeCsv(emp.salary !== null && emp.salary !== undefined ? emp.salary : ''));
      }
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="employees-export.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};
