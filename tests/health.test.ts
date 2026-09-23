import request from 'supertest';
import { createApp } from '../src/app';

describe('health', () => {
  test('returns a healthy payload', async () => {
    const app = createApp();
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'API is healthy',
    });
  });

  test('serves OpenAPI JSON and Swagger UI', async () => {
    const app = createApp();
    const spec = await request(app).get('/api-docs.json');
    expect(spec.status).toBe(200);
    expect(spec.body.openapi).toMatch(/^3\./);
    expect(spec.body.paths['/api/auth/login']).toBeDefined();

    const ui = await request(app).get('/api-docs/');
    expect(ui.status).toBe(200);
    expect(ui.text.toLowerCase()).toContain('swagger');
  });
});
