import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Employee from '../models/Employee.js';
import AuditLog from '../models/AuditLog.js';

let mongoServer;
let adminToken;
let createdEmployee;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create({ instance: { startupTimeout: 45000 } });
  await mongoose.connect(mongoServer.getUri());

  const admin = await User.create({
    name: 'Admin Test',
    email: 'admin.test@company.com',
    password: 'Password123!',
    role: 'Admin',
  });

  const dept = await Department.create({
    name: 'Operations',
    code: 'OPS',
  });

  createdEmployee = await Employee.create({
    employeeId: 'EMP-7701',
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.m@company.com',
    department: dept._id,
    jobTitle: 'Operations Analyst',
    employmentType: 'Full-time',
    joiningDate: new Date('2024-05-01'),
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin.test@company.com', password: 'Password123!' });
  adminToken = loginRes.body.token;
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

test('Stage 7: Attendance and Leave Workflows', async (t) => {
  let leaveId;

  await t.test('POST /api/attendance records daily attendance successfully', async () => {
    const res = await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employee: createdEmployee._id.toString(),
        date: '2026-10-25',
        status: 'Present',
        checkInTime: '09:00',
        checkOutTime: '17:30',
        remarks: 'On time',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.workHours, 8.5);
  });

  await t.test('POST /api/attendance prevents duplicate attendance entry for same employee and date', async () => {
    const res = await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employee: createdEmployee._id.toString(),
        date: '2026-10-25',
        status: 'Late',
        checkInTime: '10:00',
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('already recorded'));
  });

  await t.test('POST /api/leaves creates a leave request with validated date range', async () => {
    const res = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employee: createdEmployee._id.toString(),
        leaveType: 'Annual',
        startDate: '2026-11-01',
        endDate: '2026-11-05',
        reason: 'Annual family vacation',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.status, 'Pending');
    assert.equal(res.body.data.daysCount, 5);
    leaveId = res.body.data._id;
  });

  await t.test('POST /api/leaves rejects invalid date range (endDate < startDate)', async () => {
    const res = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employee: createdEmployee._id.toString(),
        leaveType: 'Casual',
        startDate: '2026-11-10',
        endDate: '2026-11-08',
        reason: 'Invalid dates test',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('End date cannot be earlier'));
  });

  await t.test('PATCH /api/leaves/:id/review approves request and logs audit trail', async () => {
    const res = await request(app)
      .patch(`/api/leaves/${leaveId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Approved',
        reviewNotes: 'Approved as per annual leave balance.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'Approved');

    // Verify AuditLog record exists
    const log = await AuditLog.findOne({ targetId: leaveId });
    assert.ok(log);
    assert.equal(log.action, 'APPROVE_LEAVE');
  });

  await t.test('PATCH /api/leaves/:id/review prevents changing already approved/rejected request', async () => {
    const res = await request(app)
      .patch(`/api/leaves/${leaveId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Rejected',
        reviewNotes: 'Attempting to overwrite decision',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('already been approved'));
  });
});
