import { DEFAULT_VIEWER_REGION_CODE } from "./ruRegions.js";

/** IANA TZ по субъекту РФ (дефолт — Москва). */
const RU_REGION_IANA_TIME_ZONE_OVERRIDES = Object.freeze({
  "RU-KGD": "Europe/Kaliningrad",
  "RU-AST": "Europe/Astrakhan",
  "RU-SAM": "Europe/Samara",
  "RU-UD": "Europe/Samara",
  "RU-ME": "Europe/Samara",
  "RU-CU": "Europe/Samara",
  "RU-TA": "Europe/Samara",
  "RU-ORE": "Asia/Yekaterinburg",
  "RU-SVE": "Asia/Yekaterinburg",
  "RU-PER": "Asia/Yekaterinburg",
  "RU-TYU": "Asia/Yekaterinburg",
  "RU-KGN": "Asia/Yekaterinburg",
  "RU-KHM": "Asia/Yekaterinburg",
  "RU-YAN": "Asia/Yekaterinburg",
  "RU-OMS": "Asia/Omsk",
  "RU-NVS": "Asia/Novosibirsk",
  "RU-ALT": "Asia/Barnaul",
  "RU-AL": "Asia/Barnaul",
  "RU-KK": "Asia/Krasnoyarsk",
  "RU-KYA": "Asia/Krasnoyarsk",
  "RU-TY": "Asia/Krasnoyarsk",
  "RU-IRK": "Asia/Irkutsk",
  "RU-BU": "Asia/Irkutsk",
  "RU-SA": "Asia/Yakutsk",
  "RU-ZAB": "Asia/Chita",
  "RU-AMU": "Asia/Yakutsk",
  "RU-PRI": "Asia/Vladivostok",
  "RU-KHA": "Asia/Vladivostok",
  "RU-YEV": "Asia/Vladivostok",
  "RU-SAK": "Asia/Sakhalin",
  "RU-MAG": "Asia/Magadan",
  "RU-KAM": "Asia/Kamchatka",
  "RU-CHU": "Asia/Kamchatka",
});

const DEFAULT_RU_IANA_TIME_ZONE = "Europe/Moscow";

const WEEKDAY_SHORT_TO_INDEX = Object.freeze({
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
});

/**
 * @param {string | null | undefined} regionCode
 * @returns {string}
 */
export function resolveRuRegionIanaTimeZone(regionCode) {
  const code = String(regionCode ?? "").trim();
  if (!code) {
    return RU_REGION_IANA_TIME_ZONE_OVERRIDES[DEFAULT_VIEWER_REGION_CODE] ?? DEFAULT_RU_IANA_TIME_ZONE;
  }
  return RU_REGION_IANA_TIME_ZONE_OVERRIDES[code] ?? DEFAULT_RU_IANA_TIME_ZONE;
}

/**
 * @param {string | null | undefined} raw
 * @returns {number | null}
 */
export function parseBusinessHoursMinutes(raw) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(raw ?? "").trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

/**
 * @param {Date} at
 * @param {string} timeZone
 * @returns {{ weekday: number; minutes: number }}
 */
export function getZonedWeekdayAndMinutes(at, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(at);
  let weekdayShort = "";
  let hour = 0;
  let minute = 0;
  for (const part of parts) {
    if (part.type === "weekday") {
      weekdayShort = part.value;
    }
    if (part.type === "hour") {
      hour = Number(part.value);
    }
    if (part.type === "minute") {
      minute = Number(part.value);
    }
  }
  const weekday = WEEKDAY_SHORT_TO_INDEX[weekdayShort];
  return {
    weekday: Number.isInteger(weekday) ? weekday : 0,
    minutes: hour * 60 + minute,
  };
}
