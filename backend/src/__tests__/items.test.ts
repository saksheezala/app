import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('GET /api/v1/items', () => {
  it('should return 200 with a list of items', async () => {
    const res = await request(app).get('/api/v1/items');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(0);
  });
});

describe('POST /api/v1/items', () => {
  it('should create a new item with a valid name', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .send({ name: 'Test Item' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      name: 'Test Item',
      id: expect.any(Number) as number,
      createdAt: expect.any(String) as string,
    });
  });

  it('should return 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .send({})
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('name');
  });

  it('should return 400 when name is an empty string', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .send({ name: '   ' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
