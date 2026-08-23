/**
 * Origin запроса: заголовок `Origin`, иначе origin из `Referer`.
 * Браузер проставляет `Origin` на всех cross-origin и на всех небезопасных
 * запросах; нативные клиенты (RN) его обычно не шлют.
 *
 * @param {import('express').Request | null | undefined} req
 * @returns {string | null}
 */
export function resolveRequestBrowserOrigin(req) {
  const origin = req?.get?.("origin");
  if (origin) {
    return origin;
  }

  const referer = req?.get?.("referer");
  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}
