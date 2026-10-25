import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    status: {
      type: String,
      required: [true, 'Attendance status is required'],
      enum: {
        values: ['Present', 'Absent', 'Late', 'On Leave'],
        message: '{VALUE} is not a valid attendance status',
      },
      default: 'Present',
    },
    checkInTime: {
      type: String, // HH:mm format, e.g. "09:15"
      trim: true,
      default: null,
    },
    checkOutTime: {
      type: String, // HH:mm format, e.g. "17:45"
      trim: true,
      default: null,
    },
    workHours: {
      type: Number,
      min: 0,
      max: 24,
      default: 0,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [300, 'Remarks cannot exceed 300 characters'],
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring one attendance record per employee per calendar date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
