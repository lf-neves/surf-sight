import { PrismaClient, User } from '@prisma/client';
import { hashPassword, comparePassword } from './password';
import { generateToken } from './jwt';
import { randomBytes } from 'crypto';
import { UserFacingError } from '../errors';
import { HttpStatusCode } from '@surf-sight/core';

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Signs up a new user
   */
  async signup(input: SignupInput): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new UserFacingError(
        'A user with this email already exists.',
        'EMAIL_ALREADY_EXISTS',
        HttpStatusCode.CONFLICT
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
    });

    // Remove password from user object before returning
    const { password, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword as User,
    };
  }

  /**
   * Logs in a user
   */
  async login(input: LoginInput): Promise<AuthResult> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UserFacingError(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
        HttpStatusCode.UNAUTHORIZED
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(
      input.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UserFacingError(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
        HttpStatusCode.UNAUTHORIZED
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
    });

    // Remove password from user object before returning
    const { password, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword as User,
    };
  }

  /**
   * Initiates password reset by generating a reset token
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return { success: true };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // TODO: Send email with reset token
    // For now, we'll just return success
    // In production, you'd send an email with the reset token

    return { success: true };
  }

  /**
   * Resets password using a reset token
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      throw new UserFacingError(
        'Invalid or expired reset token',
        'INVALID_RESET_TOKEN',
        HttpStatusCode.BAD_REQUEST
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and clear reset token
    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { success: true };
  }
}
