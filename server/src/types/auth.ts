import type { Request } from 'express';
import type { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}
