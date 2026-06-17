/** @returns {boolean} */
export function isBullMqEnabled() {
  return Boolean(process.env.REDIS_URL?.trim());
}
