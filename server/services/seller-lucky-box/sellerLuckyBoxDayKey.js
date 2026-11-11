const mskDayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Moscow",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Календарный день по Europe/Moscow в формате YYYY-MM-DD (лимит «раз в сутки»). */
export function resolveMskDayKey(date = new Date()) {
  return mskDayKeyFormatter.format(date);
}
