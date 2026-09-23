import bcrypt from 'bcrypt';
import { DateTime } from 'luxon';
import request from 'supertest';
import { sequelize } from '../src/config/database';
import { createApp } from '../src/app';
import {
  Clinic,
  User,
  Doctor,
  WorkingSchedule,
  AvailabilityException,
} from '../src/database/models';
import { ROLES, EXCEPTION_TYPES, type ExceptionType, type Role } from '../src/shared/constants';

export const app = createApp();

export async function resetDatabase(): Promise<void> {
  await sequelize.truncate({ cascade: true, restartIdentity: true });
}

export async function seedClinic(timezone = 'Asia/Kolkata'): Promise<Clinic> {
  return Clinic.create({
    name: 'Test Clinic',
    timezone,
  });
}

export async function createUser({
  clinicId,
  name = 'Test User',
  email,
  password = 'Password123',
  role = ROLES.USER,
}: {
  clinicId: number;
  name?: string;
  email: string;
  password?: string;
  role?: Role;
}): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 12);
  return User.create({
    clinicId,
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
  });
}

export async function login(email: string, password = 'Password123'): Promise<string> {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  if (!response.body.success) {
    throw new Error(`Login failed: ${JSON.stringify(response.body)}`);
  }
  return response.body.data.token as string;
}

export async function createDoctorWithSchedule({
  clinicId,
  name = 'Dr. Test',
  specialization = 'General',
  days = [1, 2, 3, 4, 5],
  intervals = [
    { startTime: '09:00:00', endTime: '13:00:00' },
    { startTime: '14:00:00', endTime: '17:00:00' },
  ],
}: {
  clinicId: number;
  name?: string;
  specialization?: string;
  days?: number[];
  intervals?: Array<{ startTime: string; endTime: string }>;
}): Promise<Doctor> {
  const doctor = await Doctor.create({
    clinicId,
    name,
    specialization,
    isActive: true,
  });

  const rows = days.flatMap((dayOfWeek) =>
    intervals.map((interval) => ({
      doctorId: doctor.id,
      dayOfWeek,
      startTime: interval.startTime,
      endTime: interval.endTime,
    }))
  );
  await WorkingSchedule.bulkCreate(rows);
  return doctor;
}

export async function addException({
  doctorId,
  type = EXCEPTION_TYPES.BREAK,
  startAt,
  endAt,
  reason = null,
}: {
  doctorId: number;
  type?: ExceptionType;
  startAt: Date;
  endAt: Date;
  reason?: string | null;
}): Promise<AvailabilityException> {
  return AvailabilityException.create({
    doctorId,
    type,
    startAt,
    endAt,
    reason,
  });
}

export function localRange(date: string, startTime: string, endTime: string, timezone: string) {
  const start = DateTime.fromISO(`${date}T${startTime}`, { zone: timezone });
  const end = DateTime.fromISO(`${date}T${endTime}`, { zone: timezone });
  return {
    startAt: start.toUTC().toJSDate(),
    endAt: end.toUTC().toJSDate(),
    startIso: start.toUTC().toISO(),
    endIso: end.toUTC().toISO(),
  };
}

export function futureWeekdayDate(timezone: string, weekday: number, daysAhead = 14): string {
  let cursor = DateTime.now().setZone(timezone).plus({ days: daysAhead }).startOf('day');
  while (cursor.weekday % 7 !== weekday) {
    cursor = cursor.plus({ days: 1 });
  }
  const iso = cursor.toISODate();
  if (!iso) {
    throw new Error('Unable to compute weekday date');
  }
  return iso;
}
