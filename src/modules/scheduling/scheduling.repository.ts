import { Op, type CreationAttributes, type FindOptions, type InstanceDestroyOptions } from 'sequelize';
import { WorkingSchedule } from './schedule.model';
import { AvailabilityException } from './exception.model';

export interface ScheduleInterval {
  start: string;
  end: string;
}

export async function findSchedulesByDoctor(
  doctorId: number,
  options: FindOptions = {}
): Promise<WorkingSchedule[]> {
  return WorkingSchedule.findAll({
    where: { doctorId },
    order: [
      ['dayOfWeek', 'ASC'],
      ['startTime', 'ASC'],
    ],
    ...options,
  });
}

export async function findSchedulesForDay(
  doctorId: number,
  dayOfWeek: number,
  options: FindOptions = {}
): Promise<WorkingSchedule[]> {
  return WorkingSchedule.findAll({
    where: { doctorId, dayOfWeek },
    order: [['startTime', 'ASC']],
    ...options,
  });
}

export async function replaceDaySchedule(
  doctorId: number,
  dayOfWeek: number,
  intervals: ScheduleInterval[],
  options: FindOptions = {}
): Promise<WorkingSchedule[]> {
  await WorkingSchedule.destroy({ where: { doctorId, dayOfWeek }, ...options });
  if (!intervals.length) {
    return [];
  }
  return WorkingSchedule.bulkCreate(
    intervals.map((interval) => ({
      doctorId,
      dayOfWeek,
      startTime: interval.start,
      endTime: interval.end,
    })),
    options
  );
}

export async function findExceptionsByDoctor(
  doctorId: number,
  options: FindOptions = {}
): Promise<AvailabilityException[]> {
  return AvailabilityException.findAll({
    where: { doctorId },
    order: [['startAt', 'ASC']],
    ...options,
  });
}

export async function findExceptionsOverlapping(
  doctorId: number,
  rangeStart: Date,
  rangeEnd: Date,
  options: FindOptions = {}
): Promise<AvailabilityException[]> {
  return AvailabilityException.findAll({
    where: {
      doctorId,
      startAt: { [Op.lt]: rangeEnd },
      endAt: { [Op.gt]: rangeStart },
    },
    ...options,
  });
}

export async function createException(
  payload: CreationAttributes<AvailabilityException>,
  options: FindOptions = {}
): Promise<AvailabilityException> {
  return AvailabilityException.create(payload, options);
}

export async function findExceptionById(
  id: number,
  options: FindOptions = {}
): Promise<AvailabilityException | null> {
  return AvailabilityException.findByPk(id, options);
}

export async function deleteException(
  exception: AvailabilityException,
  options: InstanceDestroyOptions = {}
): Promise<void> {
  await exception.destroy(options);
}
