/**
 * Atlas $search недоступен: локальный mongod, индекс не создан, tier без Search.
 *
 * @param {unknown} error
 */
export const isAtlasSearchUnavailableError = (error) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = String(
    /** @type {{ message?: string }} */ (error).message ?? "",
  ).toLowerCase();
  const code = /** @type {{ code?: number }} */ (error).code;

  if (code === 31082 || code === 291 || code === 6047401) {
    return true;
  }

  return (
    message.includes("$search") ||
    message.includes("search index") ||
    message.includes("searchnotenabled") ||
    message.includes("not supported") ||
    message.includes("unknown operator") ||
    (message.includes("index") && message.includes("not found"))
  );
};
