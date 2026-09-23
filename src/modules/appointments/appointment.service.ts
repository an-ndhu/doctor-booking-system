import { UniqueConstraintError, DatabaseError } from 'sequelize';
import { sequelize } from '../../config/database';
import * as appointmentRepository from './appointment.repository';
import * as schedulingService from '../scheduling/scheduling.service';
import { ConflictError, NotFoundError, AuthorizationError } from '../../shared/errors';
import { ROLES, APPOINTMENT_STATUSES } from '../../shared/constants';
import { toPublicAppointment } from '../../shared/utils/serializers';
import type { AuthUser } from '../../shared/constants';

function isOverlapError(error: unknown): boolean {
  return (
    error instanceof DatabaseError &&
    Boolean((error.original as { code?: string } | undefined)?.code === '23P01')
  );
}

export async function book(user: AuthUser, payload: { doctorId: number; startAt: string }) {
  try {
    const appointment = await sequelize.transaction(async (transaction) => {
      const slot = await schedulingService.assertSlotBookable(user.clinicId, payload.doctorId, payload.startAt, {
        transaction,
      });

      return appointmentRepository.create(
        {
          clinicId: user.clinicId,
          doctorId: payload.doctorId,
          userId: user.id,
          startAt: slot.startAt,
          endAt: slot.endAt,
          status: APPOINTMENT_STATUSES.BOOKED,
        },
        { transaction }
      );
    });

    return toPublicAppointment(appointment);
  } catch (error) {
    if (isOverlapError(error) || error instanceof UniqueConstraintError) {
      throw new ConflictError('Appointment slot is no longer available', 'APPOINTMENT_CONFLICT');
    }
    throw error;
  }
}

export async function list(user: AuthUser) {
  const rows =
    user.role === ROLES.ADMIN
      ? await appointmentRepository.findForClinic(user.clinicId)
      : await appointmentRepository.findForUser(user.id);
  return rows.map(toPublicAppointment);
}

export async function getById(user: AuthUser, appointmentId: number) {
  const appointment = await appointmentRepository.findById(appointmentId);
  if (!appointment || appointment.clinicId !== user.clinicId) {
    throw new NotFoundError('Appointment not found');
  }
  if (user.role !== ROLES.ADMIN && appointment.userId !== user.id) {
    throw new AuthorizationError('Insufficient permissions');
  }
  return toPublicAppointment(appointment);
}
