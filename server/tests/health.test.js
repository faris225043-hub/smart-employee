import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';

test('Stage 2: Health Check & Foundational Middleware', async (t) => {
  await t.test('GET / should return welcome message and version', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.equal(res.body.version, '1.0.0');
    assert.ok(res.body.message.includes('Smart Employee Management System'));
  });

  await t.test('GET /api/health returns health status without exposing secrets', async () => {
    const res = await request(app).get('/api/health');
    // Without DB connection, returns 503 degraded, or 200 if connected
    assert.ok([200, 503].includes(res.status));
    assert.ok(res.body.success);
    assert.ok(res.body.timestamp);
    assert.ok(res.body.database);
    assert.ok(typeof res.body.database.connected === 'boolean');
    // Verify no secret leak
    assert.equal(res.body.database.uri, undefined);
    assert.equal(res.body.database.password, undefined);
  });

  await t.test('GET /unknown-endpoint returns structured 404', async () => {
    const res = await request(app).get('/unknown-endpoint');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('Resource not found'));
  });
});
