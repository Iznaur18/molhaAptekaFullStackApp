const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

/** Окно общего IP-лимита (мс). */
export const GENERAL_RATE_LIMIT_WINDOW_MS = Number(
  process.env.RATE_LIMIT_WINDOW_MS ?? FIFTEEN_MINUTES_MS,
);

/**
 * Макс. API-запросов с IP за окно (статика /uploads и /health не считаются).
 * После TanStack Query одна загрузка SPA — десятки параллельных GET; старый 100/15m был мал.
 */
export const GENERAL_RATE_LIMIT_MAX = Number(
  process.env.RATE_LIMIT_MAX_REQUESTS ??
    (process.env.NODE_ENV === "production" ? 50_000 : 200_000),
);
