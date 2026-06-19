/** Маршруты главной: нижний таббар остаётся, активна вкладка «Главная». */
export function isHomeTabBarRoute(pathname: string): boolean {
  const normalized = pathname.trim();

  return normalized === "/users" || normalized.startsWith("/users/");
}
