import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
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
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      throw new Error('User with this email or name already exists');
    }

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

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: username,
        passwordHash,
        phone: normalizedPhone,
        referralCode: generateReferralCode(),
        referredBy,
        balance: 1000, // ₦1,000.00 Welcome Bonus
      }
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return { user, token };
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
  }
};
