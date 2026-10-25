import LeaveRequest from '../models/LeaveRequest.js';
import Employee from '../models/Employee.js';
import AuditLog from '../models/AuditLog.js';

export const createLeaveRequest = async (req, res, next) => {
  try {
    let employeeId = req.body.employee;

    // If regular Employee user, bind to their own employee ID
    if (req.user && req.user.role === 'Employee') {
      if (!req.user.employee) {
        return res.status(400).json({
          success: false,
          message: 'No employee profile linked to your user account.',
        });
      }
      employeeId = req.user.employee;
    }

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required.',
      });
    }

    const emp = await Employee.findById(employeeId);
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    const { leaveType, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    // Calculate days count inclusive
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping pending or approved leave requests
    const overlapping = await LeaveRequest.findOne({
      employee: emp._id,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: `An overlapping ${overlapping.status.toLowerCase()} leave request already exists for these dates.`,
      });
    }

    const request = await LeaveRequest.create({
      employee: emp._id,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason,
      status: 'Pending',
    });

    const populated = await LeaveRequest.findById(request._id)
      .populate('employee', 'employeeId firstName lastName email department');

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully.',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const getLeaveRequests = async (req, res, next) => {
  try {
    const { employee, status, leaveType, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (req.user && req.user.role === 'Employee') {
      if (!req.user.employee) {
        return res.json({
          success: true,
          data: [],
          pagination: { page: pageNum, limit: limitNum, totalRecords: 0, totalPages: 0 },
        });
      }
      filter.employee = req.user.employee;
    } else if (employee) {
      filter.employee = employee;
    }

    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;

    const [totalRecords, requests] = await Promise.all([
      LeaveRequest.countDocuments(filter),
      LeaveRequest.find(filter)
        .populate({
          path: 'employee',
          select: 'employeeId firstName lastName department jobTitle',
          populate: { path: 'department', select: 'name code' },
        })
        .populate('reviewedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const reviewLeaveRequest = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;
    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate('employee', 'firstName lastName email status');

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.',
      });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This leave request has already been ${leaveRequest.status.toLowerCase()} and cannot be changed.`,
      });
    }

    leaveRequest.status = status;
    leaveRequest.reviewNotes = reviewNotes || '';
    leaveRequest.reviewedBy = req.user ? req.user._id : null;
    leaveRequest.reviewedAt = new Date();

    await leaveRequest.save();

    // If approved and current date falls in range, update employee status to 'On Leave'
    const today = new Date();
    if (
      status === 'Approved' &&
      leaveRequest.startDate <= today &&
      leaveRequest.endDate >= today
    ) {
      await Employee.findByIdAndUpdate(leaveRequest.employee._id, { status: 'On Leave' });
    }

    // Create Audit Log
    await AuditLog.create({
      action: status === 'Approved' ? 'APPROVE_LEAVE' : 'REJECT_LEAVE',
      performedBy: req.user ? req.user._id : null,
      performedByName: req.user ? req.user.name : 'System Admin',
      targetModel: 'LeaveRequest',
      targetId: leaveRequest._id,
      details: {
        employeeName: `${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName}`,
        leaveType: leaveRequest.leaveType,
        daysCount: leaveRequest.daysCount,
        reviewNotes: leaveRequest.reviewNotes,
        decision: status,
      },
    });

    const updated = await LeaveRequest.findById(leaveRequest._id)
      .populate('employee', 'employeeId firstName lastName department')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()} successfully.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
