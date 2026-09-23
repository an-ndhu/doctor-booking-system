import type { AppointmentStatus, ExceptionType, Role } from '../constants';

export interface PublicUser {
  id: number;
  clinicId: number;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicDoctor {
  id: number;
  clinicId: number;
  name: string;
  specialization: string;
  email: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicClinic {
  id: number;
  name: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicAppointment {
  id: number;
  clinicId: number;
  doctorId: number;
  userId: number;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicException {
  id: number;
  doctorId: number;
  type: ExceptionType;
  startAt: Date;
  endAt: Date;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicSchedule {
  id: number;
  doctorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    clinicId: user.clinicId,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toPublicDoctor(doctor: PublicDoctor): PublicDoctor {
  return {
    id: doctor.id,
    clinicId: doctor.clinicId,
    name: doctor.name,
    specialization: doctor.specialization,
    email: doctor.email,
    isActive: doctor.isActive,
    createdAt: doctor.createdAt,
    updatedAt: doctor.updatedAt,
  };
}

export function toPublicClinic(clinic: PublicClinic): PublicClinic {
  return {
    id: clinic.id,
    name: clinic.name,
    timezone: clinic.timezone,
    createdAt: clinic.createdAt,
    updatedAt: clinic.updatedAt,
  };
}

export function toPublicAppointment(appointment: PublicAppointment): PublicAppointment {
  return {
    id: appointment.id,
    clinicId: appointment.clinicId,
    doctorId: appointment.doctorId,
    userId: appointment.userId,
    startAt: appointment.startAt,
    endAt: appointment.endAt,
    status: appointment.status,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
}

export function toPublicException(exception: PublicException): PublicException {
  return {
    id: exception.id,
    doctorId: exception.doctorId,
    type: exception.type,
    startAt: exception.startAt,
    endAt: exception.endAt,
    reason: exception.reason,
    createdAt: exception.createdAt,
    updatedAt: exception.updatedAt,
  };
}

export function toPublicSchedule(schedule: {
  id: number;
  doctorId: number;
  dayOfWeek: number;
  startTime: string | Date;
  endTime: string | Date;
}): PublicSchedule {
  return {
    id: schedule.id,
    doctorId: schedule.doctorId,
    dayOfWeek: schedule.dayOfWeek,
    startTime: String(schedule.startTime),
    endTime: String(schedule.endTime),
  };
}
