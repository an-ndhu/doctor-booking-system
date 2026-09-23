import { Op, type CreationAttributes, type FindOptions } from 'sequelize';
import { Doctor } from './doctor.model';

export async function findById(id: number, options: FindOptions = {}): Promise<Doctor | null> {
  return Doctor.findByPk(id, options);
}

export async function findByClinic(
  clinicId: number,
  { includeInactive = false } = {},
  options: FindOptions = {}
): Promise<Doctor[]> {
  const where: Record<string, unknown> = { clinicId };
  if (!includeInactive) {
    where.isActive = true;
  }
  return Doctor.findAll({
    where,
    order: [['name', 'ASC']],
    ...options,
  });
}

export async function create(payload: CreationAttributes<Doctor>, options: FindOptions = {}): Promise<Doctor> {
  return Doctor.create(payload, options);
}

export async function update(
  doctor: Doctor,
  payload: Partial<Pick<Doctor, 'name' | 'specialization' | 'email' | 'isActive'>>,
  options: FindOptions = {}
): Promise<Doctor> {
  Object.assign(doctor, payload);
  return doctor.save(options);
}

export async function findActiveInClinic(
  id: number,
  clinicId: number,
  options: FindOptions = {}
): Promise<Doctor | null> {
  return Doctor.findOne({
    where: { id, clinicId, isActive: true },
    ...options,
  });
}

export async function findInClinic(
  id: number,
  clinicId: number,
  options: FindOptions = {}
): Promise<Doctor | null> {
  return Doctor.findOne({
    where: { id, clinicId },
    ...options,
  });
}

export async function searchActive(
  clinicId: number,
  { specialization }: { specialization?: string } = {},
  options: FindOptions = {}
): Promise<Doctor[]> {
  const where: Record<string, unknown> = { clinicId, isActive: true };
  if (specialization) {
    where.specialization = { [Op.iLike]: `%${specialization}%` };
  }
  return Doctor.findAll({ where, order: [['name', 'ASC']], ...options });
}
