import request from 'supertest';
import { ROLES } from '../../src/shared/constants';
import { app, resetDatabase, seedClinic, createUser, login } from '../helpers';

describe('auth', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedClinic();
  });

  test('registration succeeds', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('john@example.com');
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.passwordHash).toBeUndefined();
  });

  test('duplicate email is rejected', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
    });
    const response = await request(app).post('/api/auth/register').send({
      name: 'John Two',
      email: 'john@example.com',
      password: 'Password123',
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  test('login succeeds and invalid password is rejected', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
    });

    const ok = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'Password123',
    });
    expect(ok.status).toBe(200);
    expect(ok.body.data.token).toBeDefined();

    const bad = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'wrong-password',
    });
    expect(bad.status).toBe(401);
  });

  test('missing JWT is rejected', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  test('invalid JWT is rejected', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(response.status).toBe(401);
  });

  test('me returns the current user', async () => {
    const clinic = await seedClinic();
    await createUser({
      clinicId: clinic.id,
      email: 'me@example.com',
      role: ROLES.USER,
    });
    const token = await login('me@example.com');
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('me@example.com');
  });
});
