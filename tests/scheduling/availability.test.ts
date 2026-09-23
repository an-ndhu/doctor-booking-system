import request from 'supertest';
import { DateTime } from 'luxon';
import { ROLES, EXCEPTION_TYPES } from '../../src/shared/constants';
import {
  app,
  resetDatabase,
  seedClinic,
  createUser,
  login,
  createDoctorWithSchedule,
  addException,
  localRange,
  futureWeekdayDate,
} from '../helpers';

describe('availability', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  test('working slots are generated and breaks/leave/booked slots are excluded', async () => {
    const timezone = 'Asia/Kolkata';
    const clinic = await seedClinic(timezone);
    await createUser({ clinicId: clinic.id, email: 'user@example.com', role: ROLES.USER });
    const doctor = await createDoctorWithSchedule({
      clinicId: clinic.id,
      days: [1, 2, 3, 4, 5],
      intervals: [{ startTime: '09:00:00', endTime: '12:00:00' }],
    });
    const token = await login('user@example.com');
    const date = futureWeekdayDate(timezone, 1);

    const breakRange = localRange(date, '10:00:00', '10:30:00', timezone);
    await addException({
      doctorId: doctor.id,
      type: EXCEPTION_TYPES.BREAK,
      startAt: breakRange.startAt,
      endAt: breakRange.endAt,
    });

    const available = await request(app)
      .get(`/api/doctors/${doctor.id}/availability`)
      .query({ date })
      .set('Authorization', `Bearer ${token}`);

    expect(available.status).toBe(200);
    const starts = available.body.data.slots.map((slot: { startAt: string }) => slot.startAt);
    expect(starts).toContain(DateTime.fromISO(`${date}T09:00:00`, { zone: timezone }).toUTC().toISO());
    expect(starts).not.toContain(breakRange.startIso);

    const bookable = available.body.data.slots.find(
      (slot: { startAt: string }) => slot.startAt !== breakRange.startIso
    );
    const booked = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ doctorId: doctor.id, startAt: bookable.startAt });
    expect(booked.status).toBe(201);

    const afterBooking = await request(app)
      .get(`/api/doctors/${doctor.id}/availability`)
      .query({ date })
      .set('Authorization', `Bearer ${token}`);
    expect(afterBooking.body.data.slots.map((slot: { startAt: string }) => slot.startAt)).not.toContain(
      bookable.startAt
    );
  });

  test('leave excludes the whole local day', async () => {
    const timezone = 'Asia/Kolkata';
    const clinic = await seedClinic(timezone);
    await createUser({ clinicId: clinic.id, email: 'user@example.com', role: ROLES.USER });
    const doctor = await createDoctorWithSchedule({
      clinicId: clinic.id,
      days: [1],
      intervals: [{ startTime: '09:00:00', endTime: '12:00:00' }],
    });
    const token = await login('user@example.com');
    const date = futureWeekdayDate(timezone, 1);
    const leave = localRange(date, '00:00:00', '23:59:59', timezone);
    await addException({
      doctorId: doctor.id,
      type: EXCEPTION_TYPES.LEAVE,
      startAt: leave.startAt,
      endAt: DateTime.fromISO(`${date}T00:00:00`, { zone: timezone }).plus({ days: 1 }).toUTC().toJSDate(),
    });

    const response = await request(app)
      .get(`/api/doctors/${doctor.id}/availability`)
      .query({ date })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.slots).toEqual([]);
  });

  test('clinic timezone is used for New York schedules', async () => {
    const timezone = 'America/New_York';
    const clinic = await seedClinic(timezone);
    await createUser({ clinicId: clinic.id, email: 'user@example.com', role: ROLES.USER });
    const doctor = await createDoctorWithSchedule({
      clinicId: clinic.id,
      days: [1, 2, 3, 4, 5],
      intervals: [{ startTime: '09:00:00', endTime: '09:30:00' }],
    });
    const token = await login('user@example.com');
    const date = futureWeekdayDate(timezone, 1);
    const expected = DateTime.fromISO(`${date}T09:00:00`, { zone: timezone }).toUTC().toISO();

    const response = await request(app)
      .get(`/api/doctors/${doctor.id}/availability`)
      .query({ date })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.slots[0].startAt).toBe(expected);
  });
});
