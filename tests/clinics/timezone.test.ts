import request from 'supertest';
import { ROLES } from '../../src/shared/constants';
import { app, resetDatabase, seedClinic, createUser, login } from '../helpers';

describe('clinic timezone', () => {
  test('admin can update timezone and invalid identifiers are rejected', async () => {
    await resetDatabase();
    const clinic = await seedClinic('UTC');
    await createUser({
      clinicId: clinic.id,
      email: 'admin@example.com',
      role: ROLES.ADMIN,
    });
    const token = await login('admin@example.com');

    const ok = await request(app)
      .put('/api/admin/clinic/timezone')
      .set('Authorization', `Bearer ${token}`)
      .send({ timezone: 'Asia/Kolkata' });
    expect(ok.status).toBe(200);
    expect(ok.body.data.clinic.timezone).toBe('Asia/Kolkata');

    const bad = await request(app)
      .put('/api/admin/clinic/timezone')
      .set('Authorization', `Bearer ${token}`)
      .send({ timezone: 'Not/A_Zone' });
    expect(bad.status).toBe(400);
  });
});
