export type Role = 'Admin' | 'HR Manager' | 'Employee';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'On Leave';
export type LeaveType = 'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Paternity' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  employee?: string | null;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  employeeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  department: Department | string;
  jobTitle: string;
  employmentType: EmploymentType;
  joiningDate: string;
  status: EmployeeStatus;
  salary?: number | null;
  manager?: { _id: string; firstName: string; lastName: string; employeeId: string } | null;
  profileImage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  _id: string;
  employee: {
    _id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    department?: { name: string; code: string };
    jobTitle?: string;
  };
  date: string;
  status: AttendanceStatus;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  workHours?: number;
  remarks?: string;
  recordedBy?: { name: string };
  createdAt: string;
}

export interface LeaveRequest {
  _id: string;
  employee: {
    _id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email?: string;
    department?: { name: string; code: string };
    jobTitle?: string;
  };
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: { name: string; role: string } | null;
  reviewNotes?: string;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface DashboardSummary {
  counts: {
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
    pendingLeaves: number;
  };
  departmentBreakdown: Array<{
    _id?: string;
    departmentName: string;
    departmentCode: string;
    count: number;
  }>;
  employmentTypeBreakdown: Array<{
    type: string;
    count: number;
  }>;
  recentEmployees: Employee[];
  payroll: {
    totalMonthly: number;
    totalAnnual: number;
    averageSalary: number;
    minSalary: number;
    maxSalary: number;
    reportedEmployees: number;
  } | null;
}
