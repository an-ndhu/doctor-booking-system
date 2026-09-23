import request from 'supertest';
import { ROLES } from '../../src/shared/constants';
import { app, resetDatabase, seedClinic, createUser, login } from '../helpers';

describe('admin users', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  test('admin can create USER or ADMIN and later change role', async () => {
    const clinic = await seedClinic();
    await createUser({
      clinicId: clinic.id,
      email: 'admin@example.com',
      role: ROLES.ADMIN,
    });
    const adminToken = await login('admin@example.com');

    const createdUser = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Pat Patient',
        email: 'pat@example.com',
        password: 'Password123',
        role: 'USER',
      });
    expect(createdUser.status).toBe(201);
    expect(createdUser.body.data.user.role).toBe('USER');

    const createdAdmin = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Alex Admin',
        email: 'alex@example.com',
        password: 'Password123',
        role: 'ADMIN',
      });
    expect(createdAdmin.status).toBe(201);
    expect(createdAdmin.body.data.user.role).toBe('ADMIN');

    const promoted = await request(app)
      .put(`/api/admin/users/${createdUser.body.data.user.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'ADMIN' });
    expect(promoted.status).toBe(200);
    expect(promoted.body.data.user.role).toBe('ADMIN');
  });

  test('cannot demote the last admin in the clinic', async () => {
    const clinic = await seedClinic();
    const onlyAdmin = await createUser({
      clinicId: clinic.id,
      email: 'admin@example.com',
      role: ROLES.ADMIN,
    });
    const adminToken = await login('admin@example.com');

    const response = await request(app)
      .put(`/api/admin/users/${onlyAdmin.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'USER' });

    expect(response.status).toBe(422);
  });

  test('public register cannot create an admin', async () => {
    await seedClinic();
    const response = await request(app).post('/api/auth/register').send({
      name: 'Hacker',
      email: 'hack@example.com',
      password: 'Password123',
      role: 'ADMIN',
    });
    expect(response.status).toBe(403);
  });

  test('public register defaults to USER when role is omitted or USER', async () => {
    await seedClinic();
    const response = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      role: 'USER',
    });
    expect(response.status).toBe(201);
    expect(response.body.data.user.role).toBe('USER');
  });
});
