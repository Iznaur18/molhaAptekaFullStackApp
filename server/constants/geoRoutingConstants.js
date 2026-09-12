/**
 * Геокодинг адресов и маршруты по дорогам — для тарифа собственной доставки
 * продавца.
 *
 * Все внешние сервисы здесь открытые (OpenStreetMap): ключей не требуют, но
 * просят не нагружать их и представляться. Поэтому ответы кэшируются в Mongo,
 * а Nominatim вызывается не чаще раза в секунду. Адреса серверов можно
 * заменить через переменные окружения — например, на свой OSRM.
 */

export const GEO_HTTP_TIMEOUT_MS = 6000;

/** Nominatim и OSRM требуют узнаваемый User-Agent — без него режут запросы. */
export const GEO_HTTP_USER_AGENT_DEFAULT = "Gitorg/1.0 (+https://gitorg.ru)";

/**
 * Маршрутизаторы по порядку. Первый — сервер FOSSGIS, на нём работает сам
 * openstreetmap.org; второй — демо-сервер проекта OSRM.
 */
export const OSRM_BASE_URLS_DEFAULT = [
  "https://routing.openstreetmap.de/routed-car",
  "https://router.project-osrm.org",
];

/** Другой движок на других данных: выручает, когда оба OSRM лежат. */
export const VALHALLA_BASE_URLS_DEFAULT = ["https://valhalla1.openstreetmap.de"];

export const OPENROUTESERVICE_DIRECTIONS_URL =
  "https://api.openrouteservice.org/v2/directions/driving-car";

export const NOMINATIM_BASE_URL_DEFAULT = "https://nominatim.openstreetmap.org";
export const PHOTON_BASE_URL_DEFAULT = "https://photon.komoot.io";

/** Правило Nominatim: не больше одного запроса в секунду. */
export const NOMINATIM_MIN_INTERVAL_MS_DEFAULT = 1100;

/**
 * Во сколько раз дорога длиннее прямой, когда ни один маршрутизатор не
 * ответил. Для города и трассы обычно 1,2–1,4; берём середину, чтобы оценка
 * не обделяла ни продавца, ни покупателя.
 */
export const ROAD_DETOUR_FACTOR = 1.3;

/** Точки ближе друг к другу считаем одной: маршрут между ними — ноль. */
export const SAME_POINT_KM = 0.03;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Дороги и адреса меняются редко — месяц кэша безопасен. */
export const GEO_CACHE_TTL_MS = 30 * DAY_MS;

/**
 * Оценка по прямой и «адрес не найден» живут недолго: сервис мог лежать
 * минуту, и навсегда застревать на запасном варианте нельзя. Десяти минут
 * хватает, чтобы котировка в корзине совпала с суммой в заказе.
 */
export const GEO_SHORT_CACHE_TTL_MS = 10 * 60 * 1000;

export const GEO_PRECISION_HOUSE = "house";
export const GEO_PRECISION_STREET = "street";
export const GEO_PRECISION_SETTLEMENT = "settlement";
export const GEO_PRECISION_REGION = "region";

/**
 * Насколько клиентская точка (метка на карте, сохранённый адрес) может
 * отстоять от найденной по тексту адреса, чтобы мы взяли её.
 *
 * Клиентская точнее — это подъезд, а не центр улицы. Но прислать её может кто
 * угодно, поэтому доверяем в пределах погрешности найденной: у дома — км, у
 * улицы — три, у населённого пункта — пятнадцать. Дальше — берём найденную.
 */
export const CLIENT_GEO_TOLERANCE_KM = {
  [GEO_PRECISION_HOUSE]: 1,
  [GEO_PRECISION_STREET]: 3,
  [GEO_PRECISION_SETTLEMENT]: 15,
  [GEO_PRECISION_REGION]: 0,
};
