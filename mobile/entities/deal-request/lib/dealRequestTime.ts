/**
 * Время заявки: форматирование и выбор дня/часа/минут без нативного календаря.
 *
 * Модуль без alias-импортов — тестируется напрямую в `node --test`
 * (scripts/deal-requests-parity.test.mjs).
 */

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

const WEEKDAYS_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const MONTHS_SHORT = [
  "янв",
  "фев",
  "мар",
  "апр",
  "мая",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

/** Сколько дней показывать в ряду чипов (дефолт discovery: две недели). */
export const DEAL_REQUEST_DAY_OPTIONS = 14;
/** Шаг минут — как `step={900}` у поля времени на сайте. */
export const DEAL_REQUEST_MINUTE_STEP = 15;

export const DEAL_REQUEST_MINUTES = Array.from(
  { length: 60 / DEAL_REQUEST_MINUTE_STEP },
  (_, index) => index * DEAL_REQUEST_MINUTE_STEP,
);
export const DEAL_REQUEST_HOURS = Array.from({ length: 24 }, (_, hour) => hour);

const pad = (value: number) => String(value).padStart(2, "0");

/** «14 октября, 18:30» по часам пользователя (паритет web `formatDealRequestTime`). */
export const formatDealRequestTime = (iso: string | null | undefined): string => {
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime()) ? DATE_TIME_FORMAT.format(date) : "";
};

export const formatTwoDigits = pad;

/** Завтра в 12:00 — не окажется в прошлом, пока форму заполняют. */
export const defaultDealRequestTime = (now: Date = new Date()): Date => {
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(12, 0, 0, 0);
  return next;
};

/** Полночь того же дня по местному времени. */
export const startOfLocalDay = (value: Date): Date => {
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  return day;
};

const dayDiff = (from: Date, to: Date) =>
  Math.round(
    (startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) / 86_400_000,
  );

export type DealRequestDayOption = {
  /** Полночь дня, мс — ключ и значение чипа. */
  value: number;
  label: string;
};

/**
 * Дни для чипов: «Сегодня», «Завтра», дальше «Чт 23 окт». Если уже выбранный
 * день дальше двух недель (продавец подтверждает время покупателя), ряд
 * дотягивается до него, чтобы выбор не пропал.
 */
export const buildDealRequestDayOptions = (
  now: Date,
  labels: { today: string; tomorrow: string },
  includeDay?: Date | null,
): DealRequestDayOption[] => {
  const extra = includeDay ? dayDiff(now, includeDay) + 1 : 0;
  const count = Math.max(DEAL_REQUEST_DAY_OPTIONS, extra);
  const today = startOfLocalDay(now);
  return Array.from({ length: count }, (_, offset) => {
    const day = new Date(today);
    day.setDate(today.getDate() + offset);
    const label =
      offset === 0
        ? labels.today
        : offset === 1
          ? labels.tomorrow
          : `${WEEKDAYS_SHORT[day.getDay()]} ${day.getDate()} ${MONTHS_SHORT[day.getMonth()]}`;
    return { value: day.getTime(), label };
  });
};

/** Минуты округляем вниз до шага сетки, чтобы выбранный чип был виден. */
export const snapToMinuteStep = (minute: number): number =>
  Math.floor(minute / DEAL_REQUEST_MINUTE_STEP) * DEAL_REQUEST_MINUTE_STEP;

export type DealRequestTimeParts = {
  dayValue: number;
  hour: number;
  minute: number;
};

export const toDealRequestTimeParts = (value: Date): DealRequestTimeParts => ({
  dayValue: startOfLocalDay(value).getTime(),
  hour: value.getHours(),
  minute: snapToMinuteStep(value.getMinutes()),
});

/** Части → ISO для сервера; `null`, если что-то не выбрано. */
export const dealRequestTimePartsToIso = (
  parts: Partial<DealRequestTimeParts>,
): string | null => {
  if (parts.dayValue == null || parts.hour == null || parts.minute == null) {
    return null;
  }
  const date = new Date(parts.dayValue);
  date.setHours(parts.hour, parts.minute, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

/**
 * Выбранное время уже прошло (переключились на «Сегодня») — сдвигаем на
 * ближайший свободный слот сетки, а не ждём ошибки при отправке.
 */
export const clampDealRequestTimeToFuture = (
  parts: DealRequestTimeParts,
  now: Date = new Date(),
): DealRequestTimeParts => {
  const iso = dealRequestTimePartsToIso(parts);
  if (!iso || new Date(iso).getTime() > now.getTime()) {
    return parts;
  }
  const next = new Date(now);
  next.setSeconds(0, 0);
  next.setMinutes(snapToMinuteStep(next.getMinutes()) + DEAL_REQUEST_MINUTE_STEP);
  return toDealRequestTimeParts(next);
};

/** Время в прошлом — сервер всё равно откажет, подсказываем сразу. */
export const isDealRequestTimeInPast = (iso: string, now: Date = new Date()) =>
  new Date(iso).getTime() <= now.getTime();
