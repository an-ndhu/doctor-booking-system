import type { CreationAttributes, FindOptions } from 'sequelize';
import { User } from './user.model';
import { ROLES } from '../../shared/constants';

export async function findById(id: number | string, options: FindOptions = {}): Promise<User | null> {
  return User.findByPk(id, options);
}

export async function findByEmail(email: string, options: FindOptions = {}): Promise<User | null> {
  return User.findOne({ where: { email: email.toLowerCase() }, ...options });
}

export async function findByClinic(clinicId: number, options: FindOptions = {}): Promise<User[]> {
  return User.findAll({
    where: { clinicId },
    order: [['id', 'ASC']],
    ...options,
  });
}

export async function findInClinic(
  id: number,
  clinicId: number,
  options: FindOptions = {}
): Promise<User | null> {
  return User.findOne({ where: { id, clinicId }, ...options });
}

export async function countAdmins(clinicId: number, options: FindOptions = {}): Promise<number> {
  return User.count({ where: { clinicId, role: ROLES.ADMIN }, ...options });
}

export async function create(payload: CreationAttributes<User>, options: FindOptions = {}): Promise<User> {
  return User.create(payload, options);
}

export async function update(
  user: User,
  payload: Partial<Pick<User, 'name' | 'email' | 'role' | 'passwordHash'>>,
  options: FindOptions = {}
): Promise<User> {
  Object.assign(user, payload);
  return user.save(options);
}

