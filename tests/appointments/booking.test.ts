import request from 'supertest';
import { ROLES } from '../../src/shared/constants';
import { Appointment } from '../../src/modules/appointments/appointment.model';
import {
  app,
  resetDatabase,
  seedClinic,
  createUser,
  login,
  createDoctorWithSchedule,
  futureWeekdayDate,
} from '../helpers';
import type { Doctor } from '../../src/modules/doctors/doctor.model';

async function firstSlot(token: string, doctorId: number, date: string) {
  const response = await request(app)
    .get(`/api/doctors/${doctorId}/availability`)
    .query({ date })
    .set('Authorization', `Bearer ${token}`);
  expect(response.status).toBe(200);
  return response.body.data.slots[0] as { startAt: string; endAt: string };
}

describe('booking', () => {
  let userToken: string;
  let doctor: Doctor;
  let date: string;

  beforeEach(async () => {
    await resetDatabase();
    const clinic = await seedClinic('Asia/Kolkata');
    await createUser({ clinicId: clinic.id, email: 'user@example.com', role: ROLES.USER });
    doctor = await createDoctorWithSchedule({
      clinicId: clinic.id,
      days: [1, 2, 3, 4, 5],
      intervals: [{ startTime: '09:00:00', endTime: '12:00:00' }],
    });
    userToken = await login('user@example.com');
    date = futureWeekdayDate('Asia/Kolkata', 1);
  });

  test('valid slot can be booked', async () => {
    const slot = await firstSlot(userToken, doctor.id, date);
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ doctorId: doctor.id, startAt: slot.startAt });

    expect(response.status).toBe(201);
    expect(response.body.data.appointment.status).toBe('BOOKED');
    expect(response.body.data.appointment.endAt).toBe(slot.endAt);
  });

  test('inactive doctor is rejected', async () => {
    await doctor.update({ isActive: false });
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ doctorId: doctor.id, startAt: '2026-09-25T03:30:00.000Z' });
    expect(response.status).toBe(422);
  });

  test('outside-hours booking is rejected', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ doctorId: doctor.id, startAt: `${date}T01:00:00.000Z` });
    expect(response.status).toBe(422);
  });

  test('already-booked slot is rejected', async () => {
    const slot = await firstSlot(userToken, doctor.id, date);
    const first = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ doctorId: doctor.id, startAt: slot.startAt });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ doctorId: doctor.id, startAt: slot.startAt });
    expect(second.status).toBe(409);
    expect(second.body.code).toBe('APPOINTMENT_CONFLICT');
  });

  test('lists the current user appointments', async () => {
    const slot = await firstSlot(userToken, doctor.id, date);
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ doctorId: doctor.id, startAt: slot.startAt });

    const list = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${userToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data.appointments).toHaveLength(1);
  });
});

describe('concurrent booking', () => {
  test('only one of two simultaneous bookings succeeds', async () => {
    await resetDatabase();
    const clinic = await seedClinic('Asia/Kolkata');
    await createUser({ clinicId: clinic.id, email: 'a@example.com', role: ROLES.USER });
    await createUser({ clinicId: clinic.id, email: 'b@example.com', role: ROLES.USER });
    const doctor = await createDoctorWithSchedule({
      clinicId: clinic.id,
      days: [1, 2, 3, 4, 5],
      intervals: [{ startTime: '09:00:00', endTime: '12:00:00' }],
    });
    const tokenA = await login('a@example.com');
    const tokenB = await login('b@example.com');
    const date = futureWeekdayDate('Asia/Kolkata', 1);
    const slot = await firstSlot(tokenA, doctor.id, date);

    const [first, second] = await Promise.all([
      request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ doctorId: doctor.id, startAt: slot.startAt }),
      request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ doctorId: doctor.id, startAt: slot.startAt }),
    ]);

    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([201, 409]);
    const count = await Appointment.count();
    expect(count).toBe(1);
  });
});
