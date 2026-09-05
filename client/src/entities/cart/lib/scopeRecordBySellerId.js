/**
 * Оставляем в payload только запись выбранного продавца.
 * @template T
 * @param {Record<string, T>} record
 * @param {string | null | undefined} sellerId
 * @returns {Record<string, T>}
 */
export function scopeRecordBySellerId(record, sellerId) {
  if (!sellerId) {
    return record;
  }
  if (record[sellerId] == null) {
    return {};
  }
  return { [sellerId]: record[sellerId] };
}
