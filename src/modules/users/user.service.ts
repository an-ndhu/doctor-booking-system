import bcrypt from 'bcrypt';
import * as userRepository from './user.repository';
import { ConflictError, NotFoundError, BusinessRuleError } from '../../shared/errors';
import { ROLES, type Role } from '../../shared/constants';
import { toPublicUser } from '../../shared/utils/serializers';

const SALT_ROUNDS = 12;

export { SALT_ROUNDS };

export async function getById(id: number) {
  return userRepository.findById(id);
}

export async function listUsers(clinicId: number) {
  const users = await userRepository.findByClinic(clinicId);
  return users.map(toPublicUser);
}

export async function getUser(clinicId: number, userId: number) {
  const user = await userRepository.findInClinic(userId, clinicId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return toPublicUser(user);
}

export async function createUser(
  clinicId: number,
  payload: { name: string; email: string; password: string; role?: Role }
) {
  const normalizedEmail = payload.email.toLowerCase();
  const existing = await userRepository.findByEmail(normalizedEmail);
  if (existing) {
    throw new ConflictError('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
  const user = await userRepository.create({
    clinicId,
    name: payload.name,
    email: normalizedEmail,
    passwordHash,
    role: payload.role ?? ROLES.USER,
  });
  return toPublicUser(user);
}

export async function updateUser(
  clinicId: number,
  userId: number,
  _actorId: number,
  payload: { name?: string; email?: string; password?: string; role?: Role }
) {
  const user = await userRepository.findInClinic(userId, clinicId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (payload.role && payload.role !== user.role && user.role === ROLES.ADMIN) {
    const adminCount = await userRepository.countAdmins(clinicId);
    if (adminCount <= 1) {
      throw new BusinessRuleError('Cannot change the role of the last admin in the clinic');
    }
  }

  if (payload.email && payload.email.toLowerCase() !== user.email) {
    const existing = await userRepository.findByEmail(payload.email);
    if (existing && existing.id !== user.id) {
      throw new ConflictError('Email is already registered');
    }
  }

  const updates: Partial<Pick<typeof user, 'name' | 'email' | 'role' | 'passwordHash'>> = {
    name: payload.name ?? user.name,
    email: payload.email ? payload.email.toLowerCase() : user.email,
    role: payload.role ?? user.role,
  };

  if (payload.password) {
    updates.passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
  }

  const updated = await userRepository.update(user, updates);
  return toPublicUser(updated);
}
