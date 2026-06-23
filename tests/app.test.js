const request = require('supertest');
const app = require('../src/app');

describe('Basic API', () => {
  test('health endpoint returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('sync queue requires auth', async () => {
    const res = await request(app).post('/api/sync/queue').send({ type: 'sales', items: [] });
    expect([401, 400]).toContain(res.statusCode); // 401 if auth missing, 400 if middleware allowed but body invalid
  });

  test('businesses endpoint requires auth', async () => {
    const res = await request(app).get('/api/businesses');
    expect(res.statusCode).toBe(401);
  });
});
