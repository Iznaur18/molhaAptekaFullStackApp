import { MoneyIdempotencyRecordModel } from "../../models/MoneyIdempotencyRecordModel.js";
import { AppError } from "../../errors/AppError.js";

export const MONEY_IDEMPOTENCY_KEY_MAX_LENGTH = 64;
export const MONEY_IDEMPOTENCY_KEY_REQUIRED_MESSAGE =
  "Укажите idempotencyKey для денежной операции";

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function requireMoneyIdempotencyKey(raw) {
  const key = String(raw ?? "")
    .trim()
    .slice(0, MONEY_IDEMPOTENCY_KEY_MAX_LENGTH);
  if (!key) {
    throw new AppError(400, MONEY_IDEMPOTENCY_KEY_REQUIRED_MESSAGE);
  }
  return key;
}

/**
 * @param {{
 *   scope: string;
 *   actorUserId: string;
 *   idempotencyKey: unknown;
 *   execute: () => Promise<Record<string, unknown>>;
 * }} input
 */
export async function runMoneyIdempotentMutation({
  scope,
  actorUserId,
  idempotencyKey,
  execute,
}) {
  const key = requireMoneyIdempotencyKey(idempotencyKey);
  const actorId = String(actorUserId);

  const existing = await MoneyIdempotencyRecordModel.findOne({
    scope,
    actorUserId: actorId,
    key,
  })
    .select("resultJson")
    .lean();

  if (existing?.resultJson) {
    try {
      return {
        ...JSON.parse(existing.resultJson),
        duplicate: true,
      };
    } catch {
      return { duplicate: true };
    }
  }

  const result = await execute();
  const { duplicate: _ignored, ...toStore } = result ?? {};

  try {
    await MoneyIdempotencyRecordModel.create({
      scope,
      actorUserId: actorId,
      key,
      resultJson: JSON.stringify(toStore),
    });
  } catch (error) {
    if (error?.code === 11000) {
      const again = await MoneyIdempotencyRecordModel.findOne({
        scope,
        actorUserId: actorId,
        key,
      })
        .select("resultJson")
        .lean();
      if (again?.resultJson) {
        try {
          return {
            ...JSON.parse(again.resultJson),
            duplicate: true,
          };
        } catch {
          return { duplicate: true };
        }
      }
    }
    throw error;
  }

  return result;
}
