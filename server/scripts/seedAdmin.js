import mongoose from 'mongoose';
import { config, validateEnv } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Employee from '../models/Employee.js';

const seedDatabase = async () => {
  try {
    validateEnv();
    await connectDB();

    console.log('[Seed] Verifying system records in MongoDB...');

    // 1. Seed Initial Departments if none exist
    let engDept = await Department.findOne({ code: 'ENG' });
    if (!engDept) {
      engDept = await Department.create({
        name: 'Engineering',
        code: 'ENG',
        description: 'Software development, infrastructure, and technical architecture.',
        isActive: true,
      });
      console.log(' - Created Department: Engineering (ENG)');
    }

    let hrDept = await Department.findOne({ code: 'HR' });
    if (!hrDept) {
      hrDept = await Department.create({
        name: 'Human Resources',
        code: 'HR',
        description: 'Personnel management, recruitment, and organizational culture.',
        isActive: true,
      });
      console.log(' - Created Department: Human Resources (HR)');
    }

    let finDept = await Department.findOne({ code: 'FIN' });
    if (!finDept) {
      finDept = await Department.create({
        name: 'Finance & Operations',
        code: 'FIN',
        description: 'Corporate accounting, budgeting, and operations.',
        isActive: true,
      });
      console.log(' - Created Department: Finance & Operations (FIN)');
    }

    // 2. Seed Admin User
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@smartems.local';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@Secure2026!';
    const adminName = process.env.INITIAL_ADMIN_NAME || 'System Administrator';

    let adminUser = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!adminUser) {
      adminUser = await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: 'Admin',
        isActive: true,
      });
      console.log(` - Created Admin Account: ${adminEmail}`);
    } else {
      console.log(` - Admin Account already exists: ${adminEmail}`);
    }

    // 3. Seed HR Manager User & Employee profile
    const hrEmail = 'hr@smartems.local';
    const hrPassword = 'Hr@Secure2026!';
    let hrUser = await User.findOne({ email: hrEmail });
    if (!hrUser) {
      let hrEmp = await Employee.findOne({ email: hrEmail });
      if (!hrEmp) {
        hrEmp = await Employee.create({
          employeeId: 'EMP-1001',
          firstName: 'Sarah',
          lastName: 'Jenkins',
          email: hrEmail,
          phone: '+1 555-0142',
          department: hrDept._id,
          jobTitle: 'HR Director',
          employmentType: 'Full-time',
          joiningDate: new Date('2023-03-15'),
          status: 'Active',
          salary: 95000,
        });
      }

      hrUser = await User.create({
        name: 'Sarah Jenkins (HR)',
        email: hrEmail,
        password: hrPassword,
        role: 'HR Manager',
        employee: hrEmp._id,
        isActive: true,
      });
      console.log(` - Created HR Manager Account: ${hrEmail}`);
    } else {
      console.log(` - HR Manager Account already exists: ${hrEmail}`);
    }

    // 4. Seed Employee User & Employee profile
    const empEmail = 'emp@smartems.local';
    const empPassword = 'Emp@Secure2026!';
    let empUser = await User.findOne({ email: empEmail });
    if (!empUser) {
      let regularEmp = await Employee.findOne({ email: empEmail });
      if (!regularEmp) {
        regularEmp = await Employee.create({
          employeeId: 'EMP-1002',
          firstName: 'David',
          lastName: 'Miller',
          email: empEmail,
          phone: '+1 555-0188',
          department: engDept._id,
          jobTitle: 'Full-Stack Developer',
          employmentType: 'Full-time',
          joiningDate: new Date('2024-01-10'),
          status: 'Active',
          salary: 88000,
        });
      }

      empUser = await User.create({
        name: 'David Miller',
        email: empEmail,
        password: empPassword,
        role: 'Employee',
        employee: regularEmp._id,
        isActive: true,
      });
      console.log(` - Created Employee Account: ${empEmail}`);
    } else {
      console.log(` - Employee Account already exists: ${empEmail}`);
    }

    console.log('====================================================');
    console.log('[Seed] Database initialization completed successfully!');
    console.log('Available Demo Logins:');
    console.log(' 1. Admin:      admin@smartems.local / Admin@Secure2026!');
    console.log(' 2. HR Manager: hr@smartems.local    / Hr@Secure2026!');
    console.log(' 3. Employee:   emp@smartems.local   / Emp@Secure2026!');
    console.log('====================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to complete database seed:', err.message);
    await disconnectDB();
    process.exit(1);
  }
};

seedDatabase();
