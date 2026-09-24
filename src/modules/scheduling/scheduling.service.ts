import { DateTime } from 'luxon';
import { sequelize } from '../../config/database';
import type { FindOptions } from 'sequelize';
import * as doctorRepository from '../doctors/doctor.repository';
import * as clinicRepository from '../clinics/clinic.repository';
import * as schedulingRepository from './scheduling.repository';
import * as appointmentRepository from '../appointments/appointment.repository';
import {
  NotFoundError,
  ValidationError,
  BusinessRuleError,
  ConflictError,
} from '../../shared/errors';
import { combineLocalDateAndTime, weekdayInTimezone } from '../../shared/utils/timezone';
import env from '../../config/env';
import { toPublicException, toPublicSchedule } from '../../shared/utils/serializers';
import {
  normalizeTime,
  intervalsOverlap,
  generateSlots,
  filterBusySlots,
  toBusyRange,
  rangesOverlap,
} from './slot-engine';
import type { ExceptionType } from '../../shared/constants';

export { generateSlots, filterBusySlots, rangesOverlap };

interface AvailabilityOptions {
  now?: DateTime;
  transaction?: FindOptions['transaction'];
  excludeAppointments?: boolean;
}

export interface SchedulePayload {
  dayOfWeek: number;
  intervals?: Array<{ start: string; end: string }>;
  startTime?: string;
  endTime?: string;
}

async function assertDoctorInClinic(
  doctorId: number,
  clinicId: number,
  { activeOnly = false }: { activeOnly?: boolean } = {}
) {
  const doctor = activeOnly
    ? await doctorRepository.findActiveInClinic(doctorId, clinicId)
    : await doctorRepository.findInClinic(doctorId, clinicId);
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }
  return doctor;
}

export async function upsertSchedule(clinicId: number, doctorId: number, payload: SchedulePayload) {
  await assertDoctorInClinic(doctorId, clinicId);

  const intervals = payload.intervals
    ? payload.intervals.map((item) => ({
        start: normalizeTime(item.start),
        end: normalizeTime(item.end),
      }))
    : [
        {
          start: normalizeTime(payload.startTime ?? ''),
          end: normalizeTime(payload.endTime ?? ''),
        },
      ];

  intervals.forEach((interval) => {
    if (interval.start >= interval.end) {
      throw new ValidationError('Validation failed', [
        { field: 'intervals', message: 'Each interval start must be before end' },
      ]);
    }
  });

  if (intervalsOverlap(intervals)) {
    throw new ValidationError('Validation failed', [
      { field: 'intervals', message: 'Schedule intervals must not overlap' },
    ]);
  }

  const rows = await sequelize.transaction((transaction) =>
    schedulingRepository.replaceDaySchedule(doctorId, payload.dayOfWeek, intervals, { transaction })
  );
  return rows.map(toPublicSchedule);
}

export async function listSchedules(clinicId: number, doctorId: number) {
  await assertDoctorInClinic(doctorId, clinicId);
  const rows = await schedulingRepository.findSchedulesByDoctor(doctorId);
  return rows.map(toPublicSchedule);
}

export async function createException(
  clinicId: number,
  doctorId: number,
  payload: { type: ExceptionType; startAt: string; endAt: string; reason?: string | null }
) {
  await assertDoctorInClinic(doctorId, clinicId);
  const startAt = DateTime.fromISO(payload.startAt, { setZone: true });
  const endAt = DateTime.fromISO(payload.endAt, { setZone: true });
  if (!startAt.isValid || !endAt.isValid || startAt >= endAt) {
    throw new ValidationError('Validation failed', [
      { field: 'startAt', message: 'Exception startAt must be before endAt' },
    ]);
  }

  const exception = await schedulingRepository.createException({
    doctorId,
    type: payload.type,
    startAt: startAt.toUTC().toJSDate(),
    endAt: endAt.toUTC().toJSDate(),
    reason: payload.reason || null,
  });
  return toPublicException(exception);
}

export async function listExceptions(clinicId: number, doctorId: number) {
  await assertDoctorInClinic(doctorId, clinicId);
  const rows = await schedulingRepository.findExceptionsByDoctor(doctorId);
  return rows.map(toPublicException);
}

export async function deleteException(clinicId: number, exceptionId: number) {
  const exception = await schedulingRepository.findExceptionById(exceptionId);
  if (!exception) {
    throw new NotFoundError('Exception not found');
  }
  await assertDoctorInClinic(exception.doctorId, clinicId);
  await schedulingRepository.deleteException(exception);
}

async function buildAvailability(
  clinicId: number,
  doctorId: number,
  date: string,
  { now, transaction, excludeAppointments = false }: AvailabilityOptions = {}
) {
  const doctor = await assertDoctorInClinic(doctorId, clinicId, { activeOnly: true });
  const clinic = await clinicRepository.findById(doctor.clinicId, { transaction });
  if (!clinic) {
    throw new NotFoundError('Clinic not found');
  }

  const timezone = clinic.timezone;
  const dayOfWeek = weekdayInTimezone(date, timezone);
  const duration = env.slotDurationMinutes;
  const schedules = await schedulingRepository.findSchedulesForDay(doctorId, dayOfWeek, {
    transaction,
  });
  const intervals = schedules.map((row) => ({
    start: normalizeTime(row.startTime),
    end: normalizeTime(row.endTime),
  }));

  const dayStart = combineLocalDateAndTime(date, '00:00:00', timezone);
  const dayEnd = dayStart.plus({ days: 1 });
  const [exceptions, appointments] = await Promise.all([
    schedulingRepository.findExceptionsOverlapping(
      doctorId,
      dayStart.toUTC().toJSDate(),
      dayEnd.toUTC().toJSDate(),
      { transaction }
    ),
    excludeAppointments
      ? Promise.resolve([])
      : appointmentRepository.findBookedOverlapping(
          doctorId,
          dayStart.toUTC().toJSDate(),
          dayEnd.toUTC().toJSDate(),
          { transaction }
        ),
  ]);

  const generated = generateSlots({
    date,
    timezone,
    intervals,
    durationMinutes: duration,
    now: now || DateTime.utc(),
  });

  const busy = [
    ...exceptions.map((item) => toBusyRange(item as unknown as Record<string, unknown>, 'startAt', 'endAt')),
    ...appointments.map((item) => toBusyRange(item as unknown as Record<string, unknown>, 'startAt', 'endAt')),
  ];

  return filterBusySlots(generated, busy).map((slot) => ({
    startAt: slot.startAt,
    endAt: slot.endAt,
  }));
}

export async function getAvailability(clinicId: number, doctorId: number, date: string) {
  return buildAvailability(clinicId, doctorId, date);
}

export async function assertSlotBookable(
  clinicId: number,
  doctorId: number,
  startAtIso: string,
  options: AvailabilityOptions = {}
) {
  const start = DateTime.fromISO(startAtIso, { setZone: true });
  if (!start.isValid) {
    throw new ValidationError('Validation failed', [
      { field: 'startAt', message: 'Invalid ISO-8601 timestamp' },
    ]);
  }

  const doctor = await doctorRepository.findInClinic(doctorId, clinicId, {
    transaction: options.transaction,
  });
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }
  if (!doctor.isActive) {
    throw new BusinessRuleError('Doctor is not currently accepting appointments');
  }

  const clinic = await clinicRepository.findById(clinicId, { transaction: options.transaction });
  if (!clinic) {
    throw new NotFoundError('Clinic not found');
  }
  const localDate = start.setZone(clinic.timezone).toISODate();
  if (!localDate) {
    throw new ValidationError('Validation failed', [
      { field: 'startAt', message: 'Invalid ISO-8601 timestamp' },
    ]);
  }
  const slots = await buildAvailability(clinicId, doctorId, localDate, {
    ...options,
    excludeAppointments: true,
  });
  const startMs = start.toUTC().toMillis();
  const match = slots.find((slot) => DateTime.fromISO(slot.startAt).toMillis() === startMs);
  if (!match) {
    throw new BusinessRuleError('Requested slot is not available');
  }

  const booked = await appointmentRepository.findBookedOverlapping(
    doctorId,
    new Date(match.startAt),
    new Date(match.endAt),
    { transaction: options.transaction }
  );
  if (booked.length) {
    throw new ConflictError('Appointment slot is no longer available', 'APPOINTMENT_CONFLICT');
  }

  return {
    startAt: new Date(match.startAt),
    endAt: new Date(match.endAt),
  };
}
