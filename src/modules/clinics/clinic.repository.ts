import type { FindOptions } from 'sequelize';
import { Clinic } from './clinic.model';

export async function findById(id: number, options: FindOptions = {}): Promise<Clinic | null> {
  return Clinic.findByPk(id, options);
}

export async function findDefault(options: FindOptions = {}): Promise<Clinic | null> {
  return Clinic.findOne({ order: [['id', 'ASC']], ...options });
}

export async function updateTimezone(
  id: number,
  timezone: string,
  options: FindOptions = {}
): Promise<Clinic | null> {
  const clinic = await Clinic.findByPk(id, options);
  if (!clinic) {
    return null;
  }
  clinic.timezone = timezone;
  await clinic.save(options);
  return clinic;
}
