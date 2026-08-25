import { AnalyticsEventModel } from "../../models/index.js";
import { insertLedgerEntryIdempotent } from "../ledger/insertLedgerEntryIdempotent.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";

/**
 * Append-only insert. Дубликат ключа → created:false (не ошибка).
 *
 * @param {{
 *   eventType: string;
 *   idempotencyKey: string;
 *   occurredAt?: Date;
 *   actorUserId?: string | null;
 *   subjectType?: string | null;
 *   subjectId?: string | null;
 *   payload?: Record<string, unknown>;
 *   suspectedFraud?: boolean;
 *   fraudReasons?: string[];
 * }} input
 */
export async function insertAnalyticsEventIdempotent(input) {
  const doc = {
    eventType: input.eventType,
    idempotencyKey: String(input.idempotencyKey).slice(0, 200),
    occurredAt: input.occurredAt ?? new Date(),
    actorUserId: input.actorUserId || null,
    subjectType: input.subjectType ?? null,
    subjectId: input.subjectId != null ? String(input.subjectId) : null,
    payload: input.payload ?? {},
    suspectedFraud: input.suspectedFraud === true,
    fraudReasons: Array.isArray(input.fraudReasons) ? input.fraudReasons : [],
  };

  return insertLedgerEntryIdempotent({
    model: AnalyticsEventModel,
    doc,
  });
}

/**
 * Fire-and-forget: ошибки только в лог, не ломают бизнес-путь.
 * @param {Parameters<typeof insertAnalyticsEventIdempotent>[0]} input
 */
export function enqueueAnalyticsEvent(input) {
  void insertAnalyticsEventIdempotent(input).catch((error) => {
    logServerEvent("error", {
      event: "analytics.event_insert_failed",
      eventType: input.eventType,
      idempotencyKey: input.idempotencyKey,
      ...formatLogError(error),
    });
  });
}
