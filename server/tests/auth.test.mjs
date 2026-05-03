import { test } from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

test('unauthenticated access to admin dashboard returns 401', async () => {
  const server = app.listen(0);
  try {
    const port = server.address().port;
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/dashboard-full`, { method: 'GET' });
    assert.equal(res.status, 401);
  } finally {
    server.close();
  }
});
