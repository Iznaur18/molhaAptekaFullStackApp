export type YandexMapsPointInput = {
  lat?: number | null;
  lon?: number | null;
  address?: string | null;
};

const hasFiniteCoord = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/**
 * Веб-ссылка Яндекс.Карт на точку (или поиск по адресу).
 */
export function buildYandexMapsWebUrl({
  lat,
  lon,
  address,
}: YandexMapsPointInput): string {
  if (hasFiniteCoord(lat) && hasFiniteCoord(lon)) {
    return `https://yandex.ru/maps/?pt=${lon},${lat}&z=17&l=map`;
  }
  const text = String(address ?? "").trim();
  if (text) {
    return `https://yandex.ru/maps/?text=${encodeURIComponent(text)}`;
  }
  return "https://yandex.ru/maps/";
}

/**
 * Deep link Яндекс.Карт (приложение). Без координат — null.
 */
export function buildYandexMapsAppUrl({
  lat,
  lon,
}: YandexMapsPointInput): string | null {
  if (!hasFiniteCoord(lat) || !hasFiniteCoord(lon)) {
    return null;
  }
  return `yandexmaps://maps.yandex.ru/?pt=${lon},${lat}&z=17`;
}

/**
 * Deep link Яндекс.Навигатора (маршрут до точки). Без координат — null.
 */
export function buildYandexNavigatorAppUrl({
  lat,
  lon,
}: YandexMapsPointInput): string | null {
  if (!hasFiniteCoord(lat) || !hasFiniteCoord(lon)) {
    return null;
  }
  return `yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lon}`;
}

/**
 * Порядок попыток открыть навигатор/карты: Навигатор → Карты app → веб.
 */
export function resolveYandexMapsOpenCandidates({
  lat,
  lon,
  address,
}: YandexMapsPointInput): string[] {
  const candidates: string[] = [];
  const navi = buildYandexNavigatorAppUrl({ lat, lon });
  if (navi) {
    candidates.push(navi);
  }
  const mapsApp = buildYandexMapsAppUrl({ lat, lon });
  if (mapsApp) {
    candidates.push(mapsApp);
  }
  candidates.push(buildYandexMapsWebUrl({ lat, lon, address }));
  return candidates;
}
