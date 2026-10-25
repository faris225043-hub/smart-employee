import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    leaveType: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: {
        values: ['Annual', 'Sick', 'Casual', 'Maternity', 'Paternity', 'Unpaid'],
        message: '{VALUE} is not a valid leave type',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    daysCount: {
      type: Number,
      required: true,
      min: [0.5, 'Minimum leave duration is half a day'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true,
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: '{VALUE} is not a valid leave status',
      },
      default: 'Pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Review notes cannot exceed 500 characters'],
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leaveRequestSchema.index({ employee: 1, status: 1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

export default LeaveRequest;
