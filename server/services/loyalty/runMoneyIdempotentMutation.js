import { MoneyIdempotencyRecordModel } from "../../models/MoneyIdempotencyRecordModel.js";
import { AppError } from "../../errors/AppError.js";

export const MONEY_IDEMPOTENCY_KEY_MAX_LENGTH = 64;
export const MONEY_IDEMPOTENCY_KEY_REQUIRED_MESSAGE =
  "Укажите idempotencyKey для денежной операции";
export const MONEY_IDEMPOTENCY_IN_PROGRESS_MESSAGE =
  "Операция уже выполняется, повторите через секунду";

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
 * @param {string | null | undefined} resultJson
 * @returns {Record<string, unknown> | null}
 */
function parseStoredResult(resultJson) {
  if (!resultJson) {
    return null;
  }
  try {
    return {
      ...JSON.parse(resultJson),
      duplicate: true,
    };
  } catch {
    return { duplicate: true };
  }
}

/**
 * Claim-first: unique insert до execute — иначе два гонщика оба мутируют деньги.
 *
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
  const filter = { scope, actorUserId: actorId, key };

  try {
    await MoneyIdempotencyRecordModel.create({
      ...filter,
      resultJson: null,
    });
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    const existing = await MoneyIdempotencyRecordModel.findOne(filter)
      .select("resultJson")
      .lean();

    const replay = parseStoredResult(existing?.resultJson);
    if (replay) {
      return replay;
    }

    throw new AppError(409, MONEY_IDEMPOTENCY_IN_PROGRESS_MESSAGE);
  }

  try {
    const result = await execute();
    const { duplicate: _ignored, ...toStore } = result ?? {};
    await MoneyIdempotencyRecordModel.updateOne(filter, {
      $set: { resultJson: JSON.stringify(toStore) },
    });
    return result;
  } catch (error) {
    await MoneyIdempotencyRecordModel.deleteOne(filter);
    throw error;
  }
}
