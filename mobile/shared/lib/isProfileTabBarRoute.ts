/** Маршруты личного кабинета: нижний таббар остаётся, активна вкладка «Профиль». */
export function isProfileTabBarRoute(pathname: string): boolean {
  const normalized = pathname.trim();

  if (normalized === "/hub" || normalized.startsWith("/hub/")) {
    return true;
  }

  return normalized === "/orders" || normalized.startsWith("/orders/");
}
