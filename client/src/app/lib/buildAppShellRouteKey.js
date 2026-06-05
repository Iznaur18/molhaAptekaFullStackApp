/**
 * Ключ Suspense при смене URL (страница + query профиля).
 *
 * @param {import('react-router-dom').Location} location
 */
export function buildAppShellRouteKey(location) {
  return `${location.pathname}${location.search}`;
}
