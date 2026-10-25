import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

// Helper to normalize date to start of UTC day
const normalizeDate = (dateInput) => {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// Helper to calculate duration in hours from "HH:mm" strings
const calculateHours = (inTime, outTime) => {
  if (!inTime || !outTime) return 0;
  const [inH, inM] = inTime.split(':').map(Number);
  const [outH, outM] = outTime.split(':').map(Number);
  const diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
  return Math.max(0, Math.round((diffMinutes / 60) * 10) / 10);
};

export const recordAttendance = async (req, res, next) => {
  try {
    const { employee, date, status, checkInTime, checkOutTime, remarks } = req.body;

    // Check employee existence
    const emp = await Employee.findById(employee);
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    const normalizedDate = normalizeDate(date);

    // Rule: Prevent duplicate attendance entries for the same employee and date
    const existing = await Attendance.findOne({
      employee: emp._id,
      date: normalizedDate,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Attendance for ${emp.firstName} ${emp.lastName} on ${normalizedDate.toISOString().slice(0, 10)} is already recorded.`,
      });
    }

    let workHours = 0;
    if (checkInTime && checkOutTime) {
      workHours = calculateHours(checkInTime, checkOutTime);
    }

    const record = await Attendance.create({
      employee: emp._id,
      date: normalizedDate,
      status,
      checkInTime: checkInTime || null,
      checkOutTime: checkOutTime || null,
      workHours,
      remarks: remarks || '',
      recordedBy: req.user ? req.user._id : null,
    });

    const populated = await Attendance.findById(record._id)
      .populate('employee', 'employeeId firstName lastName department jobTitle')
      .populate('recordedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully.',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const getAttendanceRecords = async (req, res, next) => {
  try {
    const { employee, date, startDate, endDate, status, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    // Role-based scoping: regular employees only see their own attendance
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

    if (date) {
      filter.date = normalizeDate(date);
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = normalizeDate(startDate);
      if (endDate) filter.date.$lte = normalizeDate(endDate);
    }

    if (status) {
      filter.status = status;
    }

    const [totalRecords, records] = await Promise.all([
      Attendance.countDocuments(filter),
      Attendance.find(filter)
        .populate({
          path: 'employee',
          select: 'employeeId firstName lastName department jobTitle',
          populate: { path: 'department', select: 'name code' },
        })
        .populate('recordedBy', 'name')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.json({
      success: true,
      data: records,
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

export const updateAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found.',
      });
    }

    const { status, checkInTime, checkOutTime, remarks } = req.body;

    if (status) record.status = status;
    if (checkInTime !== undefined) record.checkInTime = checkInTime;
    if (checkOutTime !== undefined) record.checkOutTime = checkOutTime;
    if (remarks !== undefined) record.remarks = remarks;

    if (record.checkInTime && record.checkOutTime) {
      record.workHours = calculateHours(record.checkInTime, record.checkOutTime);
    }

    await record.save();

    const populated = await Attendance.findById(record._id)
      .populate('employee', 'employeeId firstName lastName department')
      .populate('recordedBy', 'name');

    res.json({
      success: true,
      message: 'Attendance record updated successfully.',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};
