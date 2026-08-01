/**
 * @param {unknown} error
 * @returns {boolean} true — нарушение unique-индекса (MongoDB duplicate key).
 */
export function isDuplicateKeyError(error) {
  return Boolean(error) && typeof error === "object" && error.code === 11000;
}

/**
 * Идемпотентная вставка ledger-записи по натуральному уникальному ключу
 * (unique-индекс коллекции). Единая точка обработки гонок для денежных
 * ledger'ов (referral cashback, affiliate payout): второй гонщик упирается в
 * 11000 и получает `{ created: false }` вместо 500.
 *
 * Управление потоком остаётся у вызывающего: referral после created начисляет
 * баллы и уведомляет, affiliate использует вставку как claim идемпотентности
 * ДО движения баллов. `existingFilter` (опционально) — фильтр для повторного
 * чтения уже существующей записи при дубликате (нужно affiliate, не нужно
 * referral).
 *
 * @template TDoc
 * @param {{
 *   model: import('mongoose').Model<any>;
 *   doc: TDoc;
 *   session?: import('mongoose').ClientSession | null;
 *   existingFilter?: Record<string, unknown> | null;
 * }} params
 * @returns {Promise<{ created: boolean; entry: any | null; existing: any | null }>}
 */
export async function insertLedgerEntryIdempotent({
  model,
  doc,
  session = null,
  existingFilter = null,
}) {
  try {
    const [entry] = await model.create([doc], session ? { session } : undefined);
    return { created: true, entry, existing: null };
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }

    let existing = null;
    if (existingFilter) {
      const query = model.findOne(existingFilter);
      if (session) {
        query.session(session);
      }
      existing = await query.lean();
    }
    return { created: false, entry: null, existing };
  }
}
