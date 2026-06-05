/**
 * Кастомная ошибка приложения с HTTP-статусом.
 */
export class AppError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {boolean} [isOperational=true]
   */
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}
