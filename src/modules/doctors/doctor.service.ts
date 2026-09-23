import * as doctorRepository from './doctor.repository';
import { NotFoundError } from '../../shared/errors';
import { toPublicDoctor } from '../../shared/utils/serializers';

export async function createDoctor(
  clinicId: number,
  payload: { name: string; specialization: string; email?: string | null; isActive?: boolean }
) {
  const doctor = await doctorRepository.create({
    clinicId,
    name: payload.name,
    specialization: payload.specialization,
    email: payload.email ? payload.email.toLowerCase() : null,
    isActive: payload.isActive !== undefined ? payload.isActive : true,
  });
  return toPublicDoctor(doctor);
}

export async function listDoctors(clinicId: number, { includeInactive = false } = {}) {
  const doctors = await doctorRepository.findByClinic(clinicId, { includeInactive });
  return doctors.map(toPublicDoctor);
}

export async function getDoctor(
  clinicId: number,
  doctorId: number,
  { requireActive = false } = {}
) {
  const doctor = requireActive
    ? await doctorRepository.findActiveInClinic(doctorId, clinicId)
    : await doctorRepository.findInClinic(doctorId, clinicId);
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }
  return toPublicDoctor(doctor);
}

export async function updateDoctor(
  clinicId: number,
  doctorId: number,
  payload: { name?: string; specialization?: string; email?: string | null; isActive?: boolean }
) {
  const doctor = await doctorRepository.findInClinic(doctorId, clinicId);
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }
  const updated = await doctorRepository.update(doctor, {
    name: payload.name ?? doctor.name,
    specialization: payload.specialization ?? doctor.specialization,
    email:
      payload.email !== undefined ? (payload.email ? payload.email.toLowerCase() : null) : doctor.email,
    isActive: payload.isActive ?? doctor.isActive,
  });
  return toPublicDoctor(updated);
}

export async function deactivateDoctor(clinicId: number, doctorId: number) {
  const doctor = await doctorRepository.findInClinic(doctorId, clinicId);
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }
  const updated = await doctorRepository.update(doctor, { isActive: false });
  return toPublicDoctor(updated);
}
