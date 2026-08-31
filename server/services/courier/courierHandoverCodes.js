import { randomInt } from "node:crypto";

import { AppError } from "../../errors/AppError.js";

/** Четыре цифры: их называют вслух, стоя рядом. */
export const HANDOVER_CODE_LENGTH = 4;

/**
 * Сколько раз можно ошибиться, прежде чем код сгорит.
 *
 * Четыре цифры — это 10 000 вариантов, перебрать их вручную нельзя, но и
 * оставлять бесконечные попытки незачем: после лимита продавец выдаёт новый.
 */
export const HANDOVER_CODE_MAX_ATTEMPTS = 5;

export const HANDOVER_CODE_EXPIRED_MESSAGE =
  "Код исчерпан — попросите выдать новый";
export const HANDOVER_CODE_WRONG_MESSAGE = "Неверный код";
export const HANDOVER_CODE_MISSING_MESSAGE = "Код ещё не выдан";

/** @returns {string} */
export function generateHandoverCode() {
  return String(randomInt(0, 10 ** HANDOVER_CODE_LENGTH)).padStart(
    HANDOVER_CODE_LENGTH,
    "0",
  );
}

/**
 * Сравнение без утечки длины строки: коды одинаковой длины, но пришедшее
 * значение — пользовательский ввод.
 *
 * @param {string} expected
 * @param {string} received
 */
const codesEqual = (expected, received) => {
  const a = String(expected ?? "");
  const b = String(received ?? "").trim();
  if (a.length === 0 || a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
};

/**
 * Проверяет код и считает попытку.
 *
 * Не бросает при неверном коде намеренно: попытку надо записать в документ,
 * иначе лимит ничего не ограничивает — вызывающий сохраняет `attempts`
 * и только потом бросает `error`.
 *
 * @param {{ expected: string; received: string; attempts: number }} input
 * @returns {{ ok: boolean; attempts: number; error: AppError | null }}
 */
export function verifyHandoverCode({ expected, received, attempts }) {
  const usedAttempts = Math.max(0, Math.floor(Number(attempts) || 0));

  if (!expected) {
    return {
      ok: false,
      attempts: usedAttempts,
      error: new AppError(409, HANDOVER_CODE_MISSING_MESSAGE),
    };
  }
  if (usedAttempts >= HANDOVER_CODE_MAX_ATTEMPTS) {
    return {
      ok: false,
      attempts: usedAttempts,
      error: new AppError(429, HANDOVER_CODE_EXPIRED_MESSAGE),
    };
  }
  if (!codesEqual(expected, received)) {
    return {
      ok: false,
      attempts: usedAttempts + 1,
      error: new AppError(400, HANDOVER_CODE_WRONG_MESSAGE),
    };
  }

  return { ok: true, attempts: usedAttempts + 1, error: null };
}
