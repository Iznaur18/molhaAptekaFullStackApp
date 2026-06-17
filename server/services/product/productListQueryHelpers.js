const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const parseTruthyQueryFlag = (raw) =>
  raw != null && String(raw).trim().toLowerCase() === "true";

/**
 * @param {Record<string, unknown>} query
 */
export const parsePagination = (query) => {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * @param {Record<string, unknown>} query
 */
export const categoryFromQuery = (query) => {
  const raw = query?.productCategory;
  if (raw == null || String(raw).trim() === "") return null;
  return String(raw).trim();
};

export const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
