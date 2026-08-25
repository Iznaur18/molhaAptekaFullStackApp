import { resolveWebPathToMobileRoute } from "@/features/deep-linking/lib/resolveWebPathToMobileRoute";

/**
 * Путь из ссылки баннера шапки → маршрут приложения.
 *
 * Таблица переехала в `resolveWebPathToMobileRoute`, общую с deep link'ами.
 * Разница в поведении одна: баннер с неизвестной ссылкой никуда не ведёт
 * (`null`), тогда как входящий deep link на наш домен падает на главную.
 */
export const resolveSiteHeaderBannerMobileRoute = (linkPath: string): string | null =>
  resolveWebPathToMobileRoute(linkPath);
