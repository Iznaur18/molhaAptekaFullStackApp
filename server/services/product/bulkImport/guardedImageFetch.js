import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

/**
 * Защита от SSRF при скачивании фото по внешнему URL:
 * резолвим хост в IP и запрещаем внутренние диапазоны (loopback, private,
 * link-local, metadata, CGNAT), а редиректы ведём вручную с перепроверкой
 * каждого хопа. Остаточный риск DNS-rebinding приемлем: скачивается только
 * контент, который затем проверяется по magic-байтам как изображение.
 */

const MAX_REDIRECTS = 3;

/** @param {number} value @param {number} bits */
const inCidr4 = (value, base, bits) => {
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (value & mask) >>> 0 === (base & mask) >>> 0;
};

/** @param {string} ip @returns {number | null} */
const ipv4ToInt = (ip) => {
  const parts = ip.split(".");
  if (parts.length !== 4) {
    return null;
  }
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) {
      return null;
    }
    const octet = Number(part);
    if (octet > 255) {
      return null;
    }
    value = (value << 8) + octet;
  }
  return value >>> 0;
};

/** Запрещённые IPv4-диапазоны: [base, prefixBits]. */
const BLOCKED_V4 = [
  ["0.0.0.0", 8], // "this" сеть
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // CGNAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local + cloud metadata
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved + broadcast
];

/** @param {string} ip */
const isBlockedIpv4 = (ip) => {
  const value = ipv4ToInt(ip);
  if (value == null) {
    return true; // не смогли разобрать — считаем небезопасным
  }
  return BLOCKED_V4.some(([base, bits]) => inCidr4(value, ipv4ToInt(base), bits));
};

/** @param {string} ip */
const isBlockedIpv6 = (ip) => {
  const normalized = ip.toLowerCase().split("%")[0]; // отбрасываем zone id
  if (normalized === "::1" || normalized === "::") {
    return true; // loopback / unspecified
  }
  // IPv4-mapped / -embedded (::ffff:a.b.c.d, 64:ff9b::a.b.c.d) — проверяем вложенный v4
  const embeddedV4 = normalized.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (embeddedV4) {
    return isBlockedIpv4(embeddedV4[1]);
  }
  const firstHextet = normalized.split(":")[0];
  const head = Number.parseInt(firstHextet || "0", 16);
  if (Number.isNaN(head)) {
    return true;
  }
  if ((head & 0xffc0) === 0xfe80) {
    return true; // fe80::/10 link-local
  }
  if ((head & 0xfe00) === 0xfc00) {
    return true; // fc00::/7 unique local
  }
  if ((head & 0xff00) === 0xff00) {
    return true; // ff00::/8 multicast
  }
  return false;
};

/** @param {string} ip */
const isBlockedIp = (ip) => {
  const kind = isIP(ip);
  if (kind === 4) {
    return isBlockedIpv4(ip);
  }
  if (kind === 6) {
    return isBlockedIpv6(ip);
  }
  return true;
};

/**
 * Валидирует протокол и резолвит хост, запрещая внутренние адреса.
 *
 * @param {string} rawUrl
 * @returns {Promise<URL>}
 */
export async function assertPublicHttpUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(String(rawUrl ?? "").trim());
  } catch {
    throw new Error("Некорректный URL фото");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("URL фото должен начинаться с http:// или https://");
  }

  const host = parsed.hostname;
  if (!host) {
    throw new Error("Некорректный URL фото");
  }

  if (isIP(host)) {
    if (isBlockedIp(host)) {
      throw new Error("URL фото ведёт на внутренний адрес");
    }
    return parsed;
  }

  let addresses;
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new Error("Не удалось разрешить адрес фото");
  }

  if (!addresses.length) {
    throw new Error("Не удалось разрешить адрес фото");
  }
  for (const { address } of addresses) {
    if (isBlockedIp(address)) {
      throw new Error("URL фото ведёт на внутренний адрес");
    }
  }

  return parsed;
}

/**
 * fetch с ручным следованием редиректам и перепроверкой SSRF-гварда на каждом
 * хопе. Первый хоп должен быть уже провалидирован через assertPublicHttpUrl.
 *
 * @param {string} initialUrl
 * @param {{ signal?: AbortSignal; headers?: Record<string, string> }} [options]
 * @returns {Promise<Response>}
 */
export async function guardedImageFetch(initialUrl, options = {}) {
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      signal: options.signal,
      headers: options.headers,
    });

    if (response.status < 300 || response.status >= 400) {
      return response;
    }

    const location = response.headers.get("location");
    if (!location) {
      return response;
    }

    const nextUrl = new URL(location, currentUrl);
    await assertPublicHttpUrl(nextUrl.toString());
    currentUrl = nextUrl.toString();
  }

  throw new Error("Слишком много переадресаций фото");
}
