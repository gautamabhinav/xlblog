import request from 'supertest';
import { strict as assert } from 'assert';
import app from '../app.js';

describe('Auth middleware', function() {
  it('should return 401 for protected route when not authenticated', async function() {
    const res = await request(app).get('/api/v1/admin/dashboard-full');
    assert.equal(res.status, 401);
  });
});
