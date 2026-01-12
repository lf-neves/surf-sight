import { HttpStatusCode, logger } from '@surf-sight/core';

/**
 * UserFacingError - Error class for errors that should be shown to users
 * These errors are safe to display and don't expose internal system details
 */
export class UserFacingError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isUserFacing: boolean = true;

  constructor(
    message: string,
    code: string = 'USER_ERROR',
    statusCode: number = HttpStatusCode.BAD_REQUEST
  ) {
    super(message);
    this.name = 'UserFacingError';
    this.code = code;
    this.statusCode = statusCode;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserFacingError);
    }
  }

  /**
   * Check if an error is a UserFacingError
   */
  static isUserFacingError(error: unknown): error is UserFacingError {
    return (
      error instanceof UserFacingError ||
      (typeof error === 'object' &&
        error !== null &&
        'isUserFacing' in error &&
        (error as any).isUserFacing === true)
    );
  }

  /**
   * Convert any error to a user-facing error
   * If it's already a UserFacingError, return it
   * Otherwise, return a generic user-facing error
   */
  static fromError(error: unknown): UserFacingError {
    if (UserFacingError.isUserFacingError(error)) {
      return error;
    }

    // Log the original error for debugging
    logger.error('Non-user-facing error occurred:', error);

    // Return generic user-facing error
    return new UserFacingError(
      "Something went wrong. We're investigating the problem and will reach out to you when we solve it.",
      'INTERNAL_ERROR',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
}
