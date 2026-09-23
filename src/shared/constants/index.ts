export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const APPOINTMENT_STATUSES = {
  BOOKED: 'BOOKED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[keyof typeof APPOINTMENT_STATUSES];

export const EXCEPTION_TYPES = {
  BREAK: 'BREAK',
  LEAVE: 'LEAVE',
  UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type ExceptionType = (typeof EXCEPTION_TYPES)[keyof typeof EXCEPTION_TYPES];

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  APPOINTMENT_CONFLICT: 'APPOINTMENT_CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface AuthUser {
  id: number;
  role: Role;
  clinicId: number;
  email: string;
  name: string;
}

export interface FieldError {
  field: string;
  message: string;
}
