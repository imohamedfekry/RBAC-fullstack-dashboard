import { Prisma } from '@prisma/client';
import { Request } from 'express';

export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  code: string; // e.g., 'USER_CREATED', 'LOGIN_SUCCESS'
  message: string;
  data?: T;
  timestamp?: string;
}

export type AuthUser = Prisma.UserGetPayload<{
  include: { roles: { include: { role: true } } };
}>;

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
