import { Op, type CreationAttributes, type FindOptions } from 'sequelize';
import { Appointment } from './appointment.model';
import { APPOINTMENT_STATUSES } from '../../shared/constants';

export async function findBookedOverlapping(
  doctorId: number,
  rangeStart: Date,
  rangeEnd: Date,
  options: FindOptions = {}
): Promise<Appointment[]> {
  return Appointment.findAll({
    where: {
      doctorId,
      status: APPOINTMENT_STATUSES.BOOKED,
      startAt: { [Op.lt]: rangeEnd },
      endAt: { [Op.gt]: rangeStart },
    },
    ...options,
  });
}

export async function create(
  payload: CreationAttributes<Appointment>,
  options: FindOptions = {}
): Promise<Appointment> {
  return Appointment.create(payload, options);
}

export async function findById(id: number, options: FindOptions = {}): Promise<Appointment | null> {
  return Appointment.findByPk(id, options);
}

export async function findForUser(userId: number, options: FindOptions = {}): Promise<Appointment[]> {
  return Appointment.findAll({
    where: { userId },
    order: [['startAt', 'DESC']],
    ...options,
  });
}

export async function findForClinic(
  clinicId: number,
  options: FindOptions = {}
): Promise<Appointment[]> {
  return Appointment.findAll({
    where: { clinicId },
    order: [['startAt', 'DESC']],
    ...options,
  });
}
