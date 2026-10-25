import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [60, 'First name cannot exceed 60 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [60, 'Last name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Work email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    employmentType: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: {
        values: ['Full-time', 'Part-time', 'Contract', 'Intern'],
        message: '{VALUE} is not a valid employment type',
      },
      default: 'Full-time',
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive', 'On Leave'],
        message: '{VALUE} is not a valid employment status',
      },
      default: 'Active',
    },
    salary: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
      default: null,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    profileImage: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Indexes for common queries & searches
employeeSchema.index({ department: 1, status: 1 });
employeeSchema.index({ employmentType: 1 });
employeeSchema.index({ firstName: 'text', lastName: 'text', jobTitle: 'text' });

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
