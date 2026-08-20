/**
 * Ключ ErrorBoundary для Outlet.
 * `/` ↔ `/catalog` ↔ `/product/:id` делят один ключ — без remount Suspense при деталях.
 *
 * @param {import('react-router-dom').Location} location
 */
export function buildAppShellRouteKey(location) {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  if (
    path === "/" ||
    path === "/catalog" ||
    /^\/product\/[a-f\d]{24}$/i.test(path)
  ) {
    return "catalog-product-shell";
  }
  return `${path}${location.search}`;
}
