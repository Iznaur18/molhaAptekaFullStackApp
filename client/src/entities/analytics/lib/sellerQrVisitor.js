const VISITOR_ID_KEY = "iz.sellerQr.visitorId";
const TRACKED_KEY_PREFIX = "iz.sellerQr.tracked.";

/** @returns {string} */
function createVisitorId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Случайный id браузера — чтобы один гость не считался за переход много раз.
 * Хранилище закрыто (приватный режим) — id живёт до закрытия вкладки, и
 * подсчёт всё равно идёт.
 *
 * @returns {string}
 */
export function getSellerQrVisitorId() {
  try {
    const stored = window.localStorage.getItem(VISITOR_ID_KEY);
    if (stored) return stored;
    const created = createVisitorId();
    window.localStorage.setItem(VISITOR_ID_KEY, created);
    return created;
  } catch (error) {
    console.warn("Seller QR visitor id is not persisted", error);
    return createVisitorId();
  }
}

/**
 * Отмечает переход за сегодня. `false` — сегодня этого продавца уже считали.
 *
 * @param {string} sellerId
 * @param {Date} [now]
 * @returns {boolean}
 */
export function markSellerQrScanToday(sellerId, now = new Date()) {
  const key = `${TRACKED_KEY_PREFIX}${sellerId}`;
  const day = now.toISOString().slice(0, 10);
  try {
    if (window.localStorage.getItem(key) === day) {
      return false;
    }
    window.localStorage.setItem(key, day);
  } catch (error) {
    // Без хранилища считаем каждый заход; сервер всё равно схлопнет вошедших.
    console.warn("Seller QR scan mark is not persisted", error);
  }
  return true;
}
