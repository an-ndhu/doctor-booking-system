import * as clinicRepository from './clinic.repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { isValidIanaTimezone } from '../../shared/utils/timezone';
import { toPublicClinic } from '../../shared/utils/serializers';

export async function getClinic(clinicId: number) {
  const clinic = await clinicRepository.findById(clinicId);
  if (!clinic) {
    throw new NotFoundError('Clinic not found');
  }
  return toPublicClinic(clinic);
}

export async function updateTimezone(clinicId: number, timezone: string) {
  if (!isValidIanaTimezone(timezone)) {
    throw new ValidationError('Validation failed', [
      { field: 'timezone', message: 'Must be a valid IANA timezone identifier' },
    ]);
  }
  const clinic = await clinicRepository.updateTimezone(clinicId, timezone);
  if (!clinic) {
    throw new NotFoundError('Clinic not found');
  }
  return toPublicClinic(clinic);
}
