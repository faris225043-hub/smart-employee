import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Attendance from '../models/Attendance.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const isPrivileged = !req.user || ['Admin', 'HR Manager'].includes(req.user.role);

    // Run parallel aggregation pipelines
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      onLeaveEmployees,
      departmentStats,
      employmentTypeStats,
      recentEmployees,
      pendingLeavesCount,
      payrollSummary,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'Active' }),
      Employee.countDocuments({ status: 'Inactive' }),
      Employee.countDocuments({ status: 'On Leave' }),
      Employee.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'department',
          },
        },
        { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            departmentName: { $ifNull: ['$department.name', 'Unassigned'] },
            departmentCode: { $ifNull: ['$department.code', 'N/A'] },
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ]),
      Employee.aggregate([
        {
          $group: {
            _id: '$employmentType',
            count: { $sum: 1 },
          },
        },
        { $project: { type: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),
      Employee.find({}, isPrivileged ? {} : { salary: 0 })
        .populate('department', 'name code')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      LeaveRequest.countDocuments({ status: 'Pending' }),
      isPrivileged
        ? Employee.aggregate([
            { $match: { salary: { $ne: null, $gt: 0 } } },
            {
              $group: {
                _id: null,
                totalPayroll: { $sum: '$salary' },
                averageSalary: { $avg: '$salary' },
                minSalary: { $min: '$salary' },
                maxSalary: { $max: '$salary' },
                count: { $sum: 1 },
              },
            },
          ])
        : Promise.resolve([]),
    ]);

    const payroll = payrollSummary[0] || {
      totalPayroll: 0,
      averageSalary: 0,
      minSalary: 0,
      maxSalary: 0,
      count: 0,
    };

    res.json({
      success: true,
      data: {
        counts: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
          onLeave: onLeaveEmployees,
          pendingLeaves: pendingLeavesCount,
        },
        departmentBreakdown: departmentStats,
        employmentTypeBreakdown: employmentTypeStats,
        recentEmployees,
        payroll: isPrivileged
          ? {
              totalMonthly: Math.round(payroll.totalPayroll / 12),
              totalAnnual: Math.round(payroll.totalPayroll),
              averageSalary: Math.round(payroll.averageSalary || 0),
              minSalary: payroll.minSalary || 0,
              maxSalary: payroll.maxSalary || 0,
              reportedEmployees: payroll.count,
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};
