const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

/** Окно общего IP-лимита (мс). */
export const GENERAL_RATE_LIMIT_WINDOW_MS = Number(
  process.env.RATE_LIMIT_WINDOW_MS ?? FIFTEEN_MINUTES_MS,
);

/**
 * Макс. API-запросов с IP за окно (статика /uploads и /health не считаются).
 * После TanStack Query одна загрузка SPA — десятки параллельных GET; старый 100/15m был мал.
 * Prod 50k был слишком щедрым для scrape — тяжёлые мутации режут per-route лимитеры.
 */
export const GENERAL_RATE_LIMIT_MAX = Number(
  process.env.RATE_LIMIT_MAX_REQUESTS ??
    (process.env.NODE_ENV === "production" ? 5_000 : 200_000),
);

/** Reveal телефона чужого профиля: `GET /user/:id/phone`. */
export const USER_PHONE_REVEAL_RATE_LIMIT_PER_HOUR = Number(
  process.env.USER_PHONE_REVEAL_RATE_LIMIT_PER_HOUR ?? 30,
);
