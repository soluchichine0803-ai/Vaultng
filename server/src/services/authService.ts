import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { walletService } from './walletService';
import { TransactionType } from '@prisma/client';
import type { RegisterCredentials, LoginCredentials } from '../types/shared';
import type { JWTPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('JWT_SECRET is not defined in the environment variables. Authentication will fail.');
}

const generateToken = (payload: JWTPayload): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is missing');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

const generateReferralCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const authService = {
  register: async (data: RegisterCredentials) => {
    const username = `${data.firstName} ${data.lastName}`;

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Referral logic
    let referredBy: string | null = null;
    if (data.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: data.referralCode }
      });
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    // Normalize phone number: remove spaces, dashes, parentheses
    const normalizedPhone = data.phone.replace(/[\s\-\(\)]/g, '');

    // Create user and welcome bonus atomically
    try {
      const { user, token } = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: data.email,
            username: username,
            passwordHash,
            phone: normalizedPhone,
            referralCode: generateReferralCode(),
            referredBy,
            availableBalance: 0,
            lockedBalance: 0,
            lastLoginBonusAt: new Date(),
          }
        });

        // Credit welcome bonus
        await walletService.credit(
          newUser.id,
          1000,
          TransactionType.WELCOME_BONUS,
          'Welcome bonus for new registration',
          'WELCOME_BONUS',
          tx
        );

        // Create referral record if referred
        if (referredBy) {
          await tx.referral.create({
            data: {
              referrerId: referredBy,
              referredUserId: newUser.id,
              commission: 0,
              status: 'PENDING',
            }
          });
        }

        const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });

        return { user: newUser, token };
      });

      return { user, token };
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
        // Some Prisma versions/configurations might return target as a string instead of array
        const targetStr = Array.isArray(target) ? target.join(',') : String(target || '');

        if (targetStr.includes('email')) {
          throw new Error('An account with this email already exists.');
        }
        if (targetStr.includes('phone')) {
          throw new Error('This phone number is already registered.');
        }
        if (targetStr.includes('username')) {
          throw new Error('A user with this name already exists.');
        }
      }
      throw error;
    }
  },

  login: async (credentials: LoginCredentials) => {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: credentials.email },
          { username: credentials.email }
        ]
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    if (user.frozen) {
      throw new Error('Account is frozen');
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return { user, token };
  },

  forgotPassword: async (email: string) => {
    // Placeholder logic
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // We don't want to leak if a user exists or not
      return;
    }
    console.log(`Password reset requested for ${email}`);
    return;
  },

  resetPassword: async (password: string) => {
    // Placeholder logic
    console.log('Password reset logic executed');
    return;
  },

  updateProfile: async (userId: string, data: { username?: string, email?: string, phone?: string }) => {
    return prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        email: data.email,
        phone: data.phone,
      },
    });
  },

  changePassword: async (userId: string, data: { currentPassword: string, newPassword: string }) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isPasswordValid) throw new Error('Invalid current password');

    const newPasswordHash = await bcrypt.hash(data.newPassword, 10);
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }
};
