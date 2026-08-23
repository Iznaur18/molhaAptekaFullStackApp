import { PRIVATE_UPLOAD_SUBDIR } from "../constants/privateUploadConstants.js";

/** Сколько раз разворачиваем percent-encoding (защита от `%2570rivate`). */
const MAX_DECODE_PASSES = 4;

/**
 * @param {string} value
 * @returns {string | null} null — битый percent-encoding
 */
function decodeFully(value) {
  let current = value;
  for (let pass = 0; pass < MAX_DECODE_PASSES; pass += 1) {
    let next;
    try {
      next = decodeURIComponent(current);
    } catch {
      return null;
    }
    if (next === current) {
      return current;
    }
    current = next;
  }
  return current;
}

/**
 * Схлопывает `//`, убирает `.` и разрешает `..` — как это делает `send`
 * после нас, но до нашей проверки сегмента.
 *
 * @param {string} value
 * @returns {string[]}
 */
function resolvePathSegments(value) {
  /** @type {string[]} */
  const out = [];
  for (const segment of value.split("/")) {
    if (!segment || segment === ".") {
      continue;
    }
    if (segment === "..") {
      out.pop();
      continue;
    }
    out.push(segment);
  }
  return out;
}

/**
 * `express.static` декодирует %XX и нормализует путь уже ПОСЛЕ этого гварда,
 * поэтому сравнивать сырой `req.path` нельзя: `/uploads/%70rivate/x.jpg`,
 * `/uploads/pri%76ate/x.jpg` и `/uploads//private/x.jpg` проезжали мимо
 * `startsWith("/private/")` и отдавали приватный файл (селфи паспорта) без
 * авторизации.
 *
 * @param {string | null | undefined} rawPath `req.path` внутри маунта `/uploads`
 * @returns {{ malformed: boolean; isPrivate: boolean }}
 */
export function resolveUploadsRequestPathPrivacy(rawPath) {
  const raw = String(rawPath ?? "").replaceAll("\\", "/");
  const decoded = decodeFully(raw);
  if (decoded === null) {
    return { malformed: true, isPrivate: false };
  }

  const normalized = decoded.replaceAll("\\", "/");
  const segments = resolvePathSegments(normalized);
  const first = segments[0]?.toLowerCase() ?? "";

  return {
    malformed: false,
    isPrivate: first === PRIVATE_UPLOAD_SUBDIR.toLowerCase(),
  };
}
