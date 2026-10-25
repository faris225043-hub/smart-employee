import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Employee from '../models/Employee.js';

let mongoServer;
let adminToken;
let empToken;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create({ instance: { startupTimeout: 45000 } });
  await mongoose.connect(mongoServer.getUri());

  const dept = await Department.create({ name: 'Finance', code: 'FIN' });

  await Employee.create({
    employeeId: 'EMP-9001',
    firstName: 'Carol',
    lastName: 'Danvers',
    email: 'carol@company.com',
    department: dept._id,
    jobTitle: 'Financial Analyst',
    employmentType: 'Full-time',
    status: 'Active',
    salary: 80000,
    joiningDate: new Date('2024-01-01'),
  });

  const admin = await User.create({
    name: 'Admin Finance',
    email: 'admin.fin@company.com',
    password: 'Password123!',
    role: 'Admin',
  });

  const empUser = await User.create({
    name: 'Regular Carol',
    email: 'carol.user@company.com',
    password: 'Password123!',
    role: 'Employee',
  });

  const loginAdmin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin.fin@company.com', password: 'Password123!' });
  adminToken = loginAdmin.body.token;

  const loginEmp = await request(app)
    .post('/api/auth/login')
    .send({ email: 'carol.user@company.com', password: 'Password123!' });
  empToken = loginEmp.body.token;
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

test('Stage 5 & Backend: Dashboard Statistics and Access Scoping', async (t) => {
  await t.test('GET /api/dashboard/summary calculates counts and metrics from MongoDB for Admin', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.counts.total, 1);
    assert.equal(res.body.data.counts.active, 1);
    assert.equal(res.body.data.departmentBreakdown.length, 1);
    assert.equal(res.body.data.departmentBreakdown[0].departmentName, 'Finance');
    assert.ok(res.body.data.payroll !== null);
    assert.equal(res.body.data.payroll.totalAnnual, 80000);
  });

  await t.test('GET /api/dashboard/summary conceals payroll data from standard Employee role', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${empToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.payroll, null);
    assert.equal(res.body.data.recentEmployees[0].salary, undefined);
  });
});
