import mongoose from "mongoose";

import { AppError } from "../errors/AppError.js";

/**
 * HTTP-статус для errorHandler (без отправки ответа).
 * @param {Error & { statusCode?: number; code?: string | number; type?: string }} err
 * @returns {number}
 */
export function resolveHttpErrorStatus(err) {
  if (err instanceof AppError) {
    return err.statusCode;
  }
  if (err.name === "ValidationError" || err.name === "CastError") {
    return 400;
  }
  if (err.code === 11000) {
    return 409;
  }
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return 401;
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return 413;
  }
  if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
    return 400;
  }
  if (err instanceof mongoose.Error) {
    return 500;
  }
  if (err.type === "validation") {
    return 400;
  }
  if (err.statusCode === 429) {
    return 429;
  }
  return 500;
}
