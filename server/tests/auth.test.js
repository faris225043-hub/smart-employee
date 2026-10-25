import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/User.js';

let mongoServer;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create({ instance: { startupTimeout: 45000 } });
  await mongoose.connect(mongoServer.getUri());
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

test('Stage 6: Authentication and Role Permissions', async (t) => {
  let adminToken;
  let employeeToken;

  await t.test('Setup: Create Admin and Employee users directly', async () => {
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@company.com',
      password: 'AdminPassword123!',
      role: 'Admin',
    });
    assert.ok(admin._id);

    const employee = await User.create({
      name: 'Regular Emp',
      email: 'emp@company.com',
      password: 'EmpPassword123!',
      role: 'Employee',
    });
    assert.ok(employee._id);
  });

  await t.test('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@company.com', password: 'AdminPassword123!' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'Admin');
    adminToken = res.body.token;
  });

  await t.test('POST /api/auth/login fails with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@company.com', password: 'WrongPassword!' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('GET /api/auth/me returns current user info when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, 'admin@company.com');
  });

  await t.test('GET /api/auth/me fails when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
  });

  await t.test('Admin can create new user accounts via /api/auth/users', async () => {
    const res = await request(app)
      .post('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'HR Specialist',
        email: 'hr@company.com',
        password: 'HrPassword123!',
        role: 'HR Manager',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.user.role, 'HR Manager');
  });

  await t.test('Non-Admin is forbidden from creating user accounts', async () => {
    // Login as employee
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'emp@company.com', password: 'EmpPassword123!' });
    employeeToken = loginRes.body.token;

    const res = await request(app)
      .post('/api/auth/users')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        name: 'Another User',
        email: 'another@company.com',
        password: 'Password123!',
        role: 'Employee',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });
});
