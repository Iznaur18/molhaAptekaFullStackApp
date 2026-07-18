/**
 * @param {unknown} value
 * @returns {number}
 */
const toTimeMs = (value) => {
  if (value instanceof Date) {
    return value.getTime();
  }
  const parsed = Date.parse(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Сравнение: `priorityStatus` сверху, внутри и остальное — `createdAt` ↓.
 *
 * @param {unknown} left
 * @param {unknown} right
 * @param {{
 *   priorityStatus: string;
 *   getStatus?: (row: unknown) => unknown;
 *   getCreatedAt?: (row: unknown) => unknown;
 * }} options
 * @returns {number}
 */
export function compareByPriorityStatusFirst(left, right, options) {
  const getStatus = options.getStatus ?? ((row) => row?.status);
  const getCreatedAt = options.getCreatedAt ?? ((row) => row?.createdAt);
  const leftRank = getStatus(left) === options.priorityStatus ? 0 : 1;
  const rightRank = getStatus(right) === options.priorityStatus ? 0 : 1;
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  return toTimeMs(getCreatedAt(right)) - toTimeMs(getCreatedAt(left));
}

/**
 * @template T
 * @param {T[]} rows
 * @param {{
 *   priorityStatus: string;
 *   getStatus?: (row: T) => unknown;
 *   getCreatedAt?: (row: T) => unknown;
 * }} options
 * @returns {T[]}
 */
export function sortByPriorityStatusFirst(rows, options) {
  return [...rows].sort((left, right) =>
    compareByPriorityStatusFirst(left, right, options),
  );
}
