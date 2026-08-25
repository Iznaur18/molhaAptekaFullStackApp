import {
  HOME_ROUTE,
  normalizeWebPath,
  resolveWebPathToMobileRoute,
} from "@/features/deep-linking/lib/resolveWebPathToMobileRoute";

const APP_SCHEMES = new Set(["gitorg", "izibuy"]);
const APP_HOSTS = new Set(["gitorg.ru", "www.gitorg.ru", "izibuy.ru", "www.izibuy.ru"]);

/**
 * Путь, который мы не умеем открыть, ведёт на главную — так же, как веб
 * (`<Route path="*" element={<Navigate to="/" replace />} />` в appRoutes).
 * Раньше такая ссылка возвращала null и `useAppDeepLinking` молча ничего не
 * делал: приложение открывалось, но человек оставался там, где был.
 *
 * Важно: fallback применяется только к нашим хостам и схемам. Чужой URL
 * по-прежнему возвращает null и никуда не ведёт.
 */
const resolveOwnLink = (rawPath: string): string =>
  resolveWebPathToMobileRoute(rawPath) ?? HOME_ROUTE;

export const parseAppDeepLink = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const scheme = parsed.protocol.replace(":", "").toLowerCase();

    if (APP_SCHEMES.has(scheme)) {
      // `gitorg://product/123` → hostname "product", pathname "/123".
      const hostPath = parsed.hostname
        ? `/${parsed.hostname}${parsed.pathname}`
        : parsed.pathname;
      return resolveOwnLink(normalizeWebPath(hostPath));
    }

    if (APP_HOSTS.has(parsed.hostname.toLowerCase())) {
      return resolveOwnLink(normalizeWebPath(parsed.pathname));
    }
  } catch {
    // Не URL — но это может быть `gitorg://…` в форме, которую не осилил парсер.
    const stripped = url.replace(/^(?:gitorg|izibuy):\/\//i, "/");
    if (stripped !== url) {
      return resolveOwnLink(normalizeWebPath(stripped));
    }
  }

  return null;
};
