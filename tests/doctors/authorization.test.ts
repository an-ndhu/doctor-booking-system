import request from 'supertest';
import { ROLES } from '../../src/shared/constants';
import { app, resetDatabase, seedClinic, createUser, login } from '../helpers';

describe('authorization', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  test('admin can manage doctors and user cannot', async () => {
    const clinic = await seedClinic();
    await createUser({
      clinicId: clinic.id,
      email: 'admin@example.com',
      role: ROLES.ADMIN,
    });
    await createUser({
      clinicId: clinic.id,
      email: 'user@example.com',
      role: ROLES.USER,
    });

    const adminToken = await login('admin@example.com');
    const userToken = await login('user@example.com');

    const created = await request(app)
      .post('/api/admin/doctors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Dr. Ada',
        specialization: 'Neurology',
      });
    expect(created.status).toBe(201);

    const forbidden = await request(app)
      .post('/api/admin/doctors')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Dr. Eve',
        specialization: 'Oncology',
      });
    expect(forbidden.status).toBe(403);
  });
});
