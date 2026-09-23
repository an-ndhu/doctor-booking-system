import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import env from '../../config/env';
import * as userRepository from '../users/user.repository';
import * as clinicRepository from '../clinics/clinic.repository';
import * as userService from '../users/user.service';
import {
  ConflictError,
  AuthenticationError,
  NotFoundError,
  AuthorizationError,
} from '../../shared/errors';
import { ROLES, type Role } from '../../shared/constants';
import { toPublicUser } from '../../shared/utils/serializers';
import type { User } from '../users/user.model';

function signToken(user: User): string {
  const options: SignOptions = { expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
      clinicId: user.clinicId,
    },
    env.jwt.secret,
    options
  );
}

export async function register({
  name,
  email,
  password,
  role = ROLES.USER,
}: {
  name: string;
  email: string;
  password: string;
  role?: Role;
}) {
  if (role === ROLES.ADMIN) {
    throw new AuthorizationError('Admin accounts must be created by an existing admin');
  }

  const clinic = await clinicRepository.findDefault();
  if (!clinic) {
    throw new NotFoundError('No clinic is configured');
  }

  const publicUser = await userService.createUser(clinic.id, {
    name,
    email,
    password,
    role: ROLES.USER,
  });

  const user = await userRepository.findById(publicUser.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return {
    user: toPublicUser(user),
    token: signToken(user),
  };
}

export async function login({ email, password }: { email: string; password: string }) {
  const user = await userRepository.findByEmail(email.toLowerCase());
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new AuthenticationError('Invalid email or password');
  }

  return {
    user: toPublicUser(user),
    token: signToken(user),
  };
}

export async function me(userId: number) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return toPublicUser(user);
}
