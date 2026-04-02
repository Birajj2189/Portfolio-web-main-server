/**
 * Custom application error with an HTTP status code.
 * Use this instead of generic Error for predictable error handling.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  /**
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (default: 500)
   */
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
