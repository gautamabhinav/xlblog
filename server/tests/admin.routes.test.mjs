import { test } from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

test('GET /api/v1/admin/dashboard-full is protected', async () => {
  const server = app.listen(0);
  try {
    const port = server.address().port;
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/dashboard-full`, { method: 'GET' });
    assert.equal(res.status, 401);
  } finally {
    server.close();
  }
});

test('GET /api/v1/admin/user/:id/activity with invalid id returns 400 or 401', async () => {
  const server = app.listen(0);
  try {
    const port = server.address().port;
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/user/000000000000000000000000/activity`, { method: 'GET' });
    assert.ok(res.status === 400 || res.status === 401);
  } finally {
    server.close();
  }
});
