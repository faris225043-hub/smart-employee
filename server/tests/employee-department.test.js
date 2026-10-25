import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';

let mongoServer;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      startupTimeout: 45000,
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

test('Stage 3: Employee and Department CRUD APIs', async (t) => {
  let createdDepartmentId;
  let createdEmployeeId;

  await t.test('POST /api/departments creates a valid department', async () => {
    const res = await request(app)
      .post('/api/departments')
      .send({
        name: 'Engineering',
        code: 'ENG',
        description: 'Software and Systems Engineering',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Engineering');
    assert.equal(res.body.data.code, 'ENG');
    createdDepartmentId = res.body.data._id;
  });

  await t.test('POST /api/departments prevents duplicate department name or code', async () => {
    const res = await request(app)
      .post('/api/departments')
      .send({
        name: 'Engineering',
        code: 'ENG2',
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('already exists'));
  });

  await t.test('POST /api/departments validates required fields', async () => {
    const res = await request(app)
      .post('/api/departments')
      .send({
        name: 'E', // too short
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /api/employees creates employee with auto ID', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@company.com',
        phone: '+1-555-0199',
        department: createdDepartmentId,
        jobTitle: 'Senior Software Engineer',
        employmentType: 'Full-time',
        joiningDate: '2025-01-15',
        salary: 115000,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.firstName, 'Jane');
    assert.ok(res.body.data.employeeId.startsWith('EMP-'));
    assert.equal(res.body.data.department.name, 'Engineering');
    createdEmployeeId = res.body.data._id;
  });

  await t.test('POST /api/employees rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send({
        firstName: 'Duplicate',
        lastName: 'User',
        email: 'jane.doe@company.com',
        department: createdDepartmentId,
        jobTitle: 'QA Engineer',
        employmentType: 'Full-time',
        joiningDate: '2025-02-01',
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('already exists'));
  });

  await t.test('GET /api/employees supports pagination, search, and filtering', async () => {
    const res = await request(app)
      .get('/api/employees')
      .query({ search: 'Jane', department: createdDepartmentId, page: 1, limit: 10 });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.pagination.totalRecords, 1);
    assert.equal(res.body.data[0].email, 'jane.doe@company.com');
  });

  await t.test('DELETE /api/departments blocks deletion if employees are assigned', async () => {
    const res = await request(app).delete(`/api/departments/${createdDepartmentId}`);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('Cannot delete department'));
  });

  await t.test('PUT /api/employees updates employee record', async () => {
    const res = await request(app)
      .put(`/api/employees/${createdEmployeeId}`)
      .send({
        jobTitle: 'Lead Software Engineer',
        status: 'Active',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.jobTitle, 'Lead Software Engineer');
  });

  await t.test('DELETE /api/employees removes employee', async () => {
    const res = await request(app).delete(`/api/employees/${createdEmployeeId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const check = await request(app).get(`/api/employees/${createdEmployeeId}`);
    assert.equal(check.status, 404);
  });

  await t.test('DELETE /api/departments succeeds once no employees are assigned', async () => {
    const res = await request(app).delete(`/api/departments/${createdDepartmentId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
