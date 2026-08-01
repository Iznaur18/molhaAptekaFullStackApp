import mongoose from "mongoose";

import { logServerEvent } from "./logServerEvent.js";

/** @type {boolean | null} null = ещё не проверяли */
let mongoTransactionsEnabled = null;

/**
 * @param {unknown} error
 */
const isMongoTransactionUnsupportedError = (error) => {
  const codes = new Set([20, 263]);
  const candidates = [
    error,
    /** @type {{ originalError?: unknown; errorResponse?: { originalError?: unknown } }} */ (
      error
    )?.originalError,
    /** @type {{ errorResponse?: { originalError?: unknown } }} */ (error)
      ?.errorResponse?.originalError,
  ];

  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === "object" &&
      "code" in candidate &&
      codes.has(Number(candidate.code))
    ) {
      return true;
    }
  }

  const message = String(/** @type {{ message?: string }} */ (error)?.message ?? error);
  return (
    message.includes("replica set") ||
    message.includes("retryable writes") ||
    message.includes("Transaction numbers")
  );
};

/**
 * @template T
 * @param {(session: import('mongoose').ClientSession | null) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export const runInTransaction = async (callback) => {
  if (mongoTransactionsEnabled === false) {
    return callback(null);
  }

  const session = await mongoose.startSession();

  try {
    let result;
    await session.withTransaction(async () => {
      result = await callback(session);
    });
    mongoTransactionsEnabled = true;
    return /** @type {T} */ (result);
  } catch (error) {
    if (
      mongoTransactionsEnabled !== true &&
      isMongoTransactionUnsupportedError(error) &&
      process.env.NODE_ENV !== "production"
    ) {
      mongoTransactionsEnabled = false;
      logServerEvent("warn", {
        event: "mongo_transactions_unsupported_dev_fallback",
        detail:
          "Replica set недоступен — операции без транзакции (только dev). Для prod: Atlas или rs0.",
      });
      return callback(null);
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * @param {Record<string, unknown>} [options]
 * @param {import('mongoose').ClientSession | null | undefined} session
 */
export const withMongoSession = (options = {}, session = null) =>
  session ? { ...options, session } : options;

/** @internal сброс кэша между тестами fallback */
export const resetMongoTransactionSupportForTests = () => {
  mongoTransactionsEnabled = null;
};
