/** SSOT: `contract/src/productWrite.js`. */
export {
  PRODUCT_IMAGE_URLS_MAX,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_DESCRIPTION_MIN_CHARS,
  PRODUCT_DESCRIPTION_MAX_CHARS,
  PRODUCT_PRICE_RUB_MAX,
  SELLER_PRODUCTS_LIMIT_REGULAR,
  SELLER_PRODUCTS_LIMIT_PREMIUM,
  SELLER_PRODUCTS_LIMIT_ERROR_MESSAGE,
} from "@molha/api-contract";

/** Максимальная длительность превью-видео на карточке товара (сек). */
export const PRODUCT_PREVIEW_VIDEO_MAX_DURATION_SEC = 3;

export const PRODUCT_PRICE_RUB_MAX_ERROR_MESSAGE =
  "Цена не может превышать 999 999 999 ₽";

export const PRODUCT_CATEGORY_GROCERY = "grocery";
export const PRODUCT_CATEGORY_ELECTRONICS = "electronics";
export const PRODUCT_CATEGORY_CLOTHING = "clothing";
export const PRODUCT_CATEGORY_FOOTWEAR = "footwear";
export const PRODUCT_CATEGORY_HOME_GARDEN = "home_garden";
export const PRODUCT_CATEGORY_KIDS = "kids";
export const PRODUCT_CATEGORY_BEAUTY_HEALTH = "beauty_health";
export const PRODUCT_CATEGORY_APPLIANCES = "appliances";
export const PRODUCT_CATEGORY_SPORT_LEISURE = "sport_leisure";
export const PRODUCT_CATEGORY_CONSTRUCTION = "construction";
export const PRODUCT_CATEGORY_PHARMACY = "pharmacy";
export const PRODUCT_CATEGORY_PETS = "pets";
export const PRODUCT_CATEGORY_BOOKS = "books";
export const PRODUCT_CATEGORY_TOURISM_OUTDOORS = "tourism_outdoors";
export const PRODUCT_CATEGORY_AUTO_PARTS = "auto_parts";
export const PRODUCT_CATEGORY_HOBBY_CRAFTS = "hobby_crafts";
export const PRODUCT_CATEGORY_ACCESSORIES = "accessories";
export const PRODUCT_CATEGORY_JEWELRY = "jewelry";
export const PRODUCT_CATEGORY_MUSIC_VIDEO = "music_video";
export const PRODUCT_CATEGORY_STATIONERY = "stationery";
export const PRODUCT_CATEGORY_ANTIQUES = "antiques";
export const PRODUCT_CATEGORY_DIGITAL = "digital";
export const PRODUCT_CATEGORY_HOUSEHOLD_CARE = "household_care";
export const PRODUCT_CATEGORY_GAMES = "games";
export const PRODUCT_CATEGORY_AUTOMOBILES = "automobiles";
export const PRODUCT_CATEGORY_TRAVEL_SERVICES = "travel_services";
/** Устаревший slug (до расширения списка). */
export const PRODUCT_CATEGORY_FOOD = "food";

/**
 * TEMP: flat hardcoded category list off — UI/admin pickers use tree/API only.
 * Labels (`PRODUCT_CATEGORY_LABEL_RU`) stay for legacy display.
 * Flip to `true` to restore dropdown/admin flat options.
 */
export const IS_HARDCODED_PRODUCT_CATEGORIES_ENABLED = false;

/** Полный legacy-список (тип / отображение slug’ов; UI-список — через флаг). */
export const PRODUCT_CATEGORIES_HARDCODED = [
  PRODUCT_CATEGORY_GROCERY,
  PRODUCT_CATEGORY_ELECTRONICS,
  PRODUCT_CATEGORY_CLOTHING,
  PRODUCT_CATEGORY_FOOTWEAR,
  PRODUCT_CATEGORY_HOME_GARDEN,
  PRODUCT_CATEGORY_KIDS,
  PRODUCT_CATEGORY_BEAUTY_HEALTH,
  PRODUCT_CATEGORY_APPLIANCES,
  PRODUCT_CATEGORY_SPORT_LEISURE,
  PRODUCT_CATEGORY_CONSTRUCTION,
  PRODUCT_CATEGORY_PHARMACY,
  PRODUCT_CATEGORY_PETS,
  PRODUCT_CATEGORY_BOOKS,
  PRODUCT_CATEGORY_TOURISM_OUTDOORS,
  PRODUCT_CATEGORY_AUTO_PARTS,
  PRODUCT_CATEGORY_HOBBY_CRAFTS,
  PRODUCT_CATEGORY_ACCESSORIES,
  PRODUCT_CATEGORY_JEWELRY,
  PRODUCT_CATEGORY_MUSIC_VIDEO,
  PRODUCT_CATEGORY_STATIONERY,
  PRODUCT_CATEGORY_ANTIQUES,
  PRODUCT_CATEGORY_DIGITAL,
  PRODUCT_CATEGORY_HOUSEHOLD_CARE,
  PRODUCT_CATEGORY_GAMES,
  PRODUCT_CATEGORY_AUTOMOBILES,
  PRODUCT_CATEGORY_TRAVEL_SERVICES,
  PRODUCT_CATEGORY_FOOD,
];

/** Порядок — для фильтра и admin legacy-picker’ов. */
export const PRODUCT_CATEGORIES = IS_HARDCODED_PRODUCT_CATEGORIES_ENABLED
  ? PRODUCT_CATEGORIES_HARDCODED
  : [];

/** Inline SVG — без сети, мгновенно в <img>. */
export const PRODUCT_IMAGE_PLACEHOLDER_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23dbeafe'/%3E%3Cdefs%3E%3Cpattern id='d' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='10' cy='10' r='2.5' fill='%2360a5fa' opacity='.55'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23d)'/%3E%3C/svg%3E";

/** Первые N карточек каталога — eager, остальные lazy. */
export const CATALOG_ABOVE_FOLD_EAGER_IMAGE_COUNT = 8;

/** Подписи для UI (сервер отдаёт только ключ enum). */
export const PRODUCT_CATEGORY_LABEL_RU = {
  [PRODUCT_CATEGORY_GROCERY]: "Продукты питания",
  [PRODUCT_CATEGORY_ELECTRONICS]: "Электроника",
  [PRODUCT_CATEGORY_CLOTHING]: "Одежда",
  [PRODUCT_CATEGORY_FOOTWEAR]: "Обувь",
  [PRODUCT_CATEGORY_HOME_GARDEN]: "Дом и сад",
  [PRODUCT_CATEGORY_KIDS]: "Детские товары",
  [PRODUCT_CATEGORY_BEAUTY_HEALTH]: "Красота и здоровье",
  [PRODUCT_CATEGORY_APPLIANCES]: "Бытовая техника",
  [PRODUCT_CATEGORY_SPORT_LEISURE]: "Спорт и отдых",
  [PRODUCT_CATEGORY_CONSTRUCTION]: "Строительство и ремонт",
  [PRODUCT_CATEGORY_PHARMACY]: "Аптека",
  [PRODUCT_CATEGORY_PETS]: "Товары для животных",
  [PRODUCT_CATEGORY_BOOKS]: "Книги",
  [PRODUCT_CATEGORY_TOURISM_OUTDOORS]: "Туризм, рыбалка, охота",
  [PRODUCT_CATEGORY_AUTO_PARTS]: "Автотовары",
  [PRODUCT_CATEGORY_HOBBY_CRAFTS]: "Хобби и творчество",
  [PRODUCT_CATEGORY_ACCESSORIES]: "Аксессуары",
  [PRODUCT_CATEGORY_JEWELRY]: "Ювелирные украшения",
  [PRODUCT_CATEGORY_MUSIC_VIDEO]: "Музыка и видео",
  [PRODUCT_CATEGORY_STATIONERY]: "Канцелярские товары",
  [PRODUCT_CATEGORY_ANTIQUES]: "Антиквариат и коллекционирование",
  [PRODUCT_CATEGORY_DIGITAL]: "Цифровые товары",
  [PRODUCT_CATEGORY_HOUSEHOLD_CARE]: "Бытовая химия и гигиена",
  [PRODUCT_CATEGORY_GAMES]: "Игры и консоли",
  [PRODUCT_CATEGORY_AUTOMOBILES]: "Автомобили",
  [PRODUCT_CATEGORY_TRAVEL_SERVICES]: "Билеты, отели, туры",
  [PRODUCT_CATEGORY_FOOD]: "Продукты",
};

/** Верхняя граница `limit` в `server/controllers/Product/getProducts.js`. */
export const PRODUCTS_FETCH_PAGE_LIMIT = 100;

/** Размер страницы каталога на главной (клиент). */
export const CATALOG_PAGE_SIZE = 24;

/** Query `sort` для GET /product — совпадает с `server/constants/productCatalogSort.js`. */
export const CATALOG_SORT_NEWEST = "newest";
export const CATALOG_SORT_VIEWS = "views";
export const CATALOG_SORT_PURCHASES = "purchases";
export const CATALOG_SORT_PREMIUM = "premium";
export const CATALOG_SORT_CONFIRMED = "confirmed";
export const CATALOG_SORT_REVIEWS = "reviews";

/** Значения `<select>` каталога (не уходят в query `sort`). */
export const CATALOG_FILTER_FOLLOWING_ONLY = "__following_only__";
export const CATALOG_FILTER_AUCTION_ONLY = "__auction_only__";
export const CATALOG_FILTER_INSTALLMENT_ONLY = "__installment_only__";
export const CATALOG_FILTER_SALE_ONLY = "__sale_only__";
export const CATALOG_FILTER_RENTAL_ONLY = "__rental_only__";
export const CATALOG_FILTER_AFFILIATE_ONLY = "__affiliate_only__";
export const CATALOG_FILTER_WHOLESALE_ONLY = "__wholesale_only__";
export const CATALOG_FILTER_ORIGINAL_ONLY = "__original_only__";
export const CATALOG_FILTER_NEAR = "__near__";

export const CATALOG_SORT_OPTIONS = [
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_VIEWS,
  CATALOG_SORT_PURCHASES,
  CATALOG_SORT_PREMIUM,
  CATALOG_SORT_CONFIRMED,
];

/** Публичный каталог: категории + сортировка + фильтры в одном списке. */
export const CATALOG_SELECT_OPTIONS = [
  ...CATALOG_SORT_OPTIONS,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_AUCTION_ONLY,
];

/** Переключатели фильтров публичного каталога (не query `sort`). */
export const CATALOG_PUBLIC_FILTER_TOGGLE_KEYS = [
  CATALOG_FILTER_NEAR,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_AUCTION_ONLY,
  CATALOG_FILTER_INSTALLMENT_ONLY,
  CATALOG_FILTER_SALE_ONLY,
  CATALOG_FILTER_RENTAL_ONLY,
  CATALOG_FILTER_AFFILIATE_ONLY,
  CATALOG_FILTER_WHOLESALE_ONLY,
  CATALOG_FILTER_ORIGINAL_ONLY,
];

/** Сортировки в «Мои товары» (без фильтра только премиум). */
export const CATALOG_SORT_OPTIONS_MY_PRODUCTS = [
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_VIEWS,
  CATALOG_SORT_PURCHASES,
  CATALOG_SORT_REVIEWS,
];

/** Фильтр статуса модерации в «Мои товары» (query `moderationStatus`). */
export const MY_PRODUCTS_MODERATION_FILTER_ALL = "";
export const MY_PRODUCTS_MODERATION_FILTER_PENDING = "pending";
export const MY_PRODUCTS_MODERATION_FILTER_REJECTED = "rejected";

export const MY_PRODUCTS_MODERATION_FILTER_OPTIONS = [
  MY_PRODUCTS_MODERATION_FILTER_ALL,
  MY_PRODUCTS_MODERATION_FILTER_PENDING,
  MY_PRODUCTS_MODERATION_FILTER_REJECTED,
];

/** @type {Record<string, string>} */
export const MY_PRODUCTS_MODERATION_FILTER_LABEL_RU = {
  [MY_PRODUCTS_MODERATION_FILTER_ALL]: "Все",
  [MY_PRODUCTS_MODERATION_FILTER_PENDING]: "На проверке",
  [MY_PRODUCTS_MODERATION_FILTER_REJECTED]: "Отклонены",
};

/** @type {Record<string, string>} */
export const CATALOG_SORT_LABEL_RU = {
  [CATALOG_SORT_NEWEST]: "Новинки",
  [CATALOG_SORT_VIEWS]: "По просмотрам",
  [CATALOG_SORT_PURCHASES]: "Больше всего купили",
  [CATALOG_SORT_PREMIUM]: "Только премиум",
  [CATALOG_SORT_CONFIRMED]: "Подтверждённые продавцы",
  [CATALOG_SORT_REVIEWS]: "По отзывам",
  [CATALOG_FILTER_NEAR]: "Рядом",
  [CATALOG_FILTER_FOLLOWING_ONLY]: "Только от подписок",
  [CATALOG_FILTER_AUCTION_ONLY]: "Только с аукционом",
  [CATALOG_FILTER_INSTALLMENT_ONLY]: "Только в рассрочку",
  [CATALOG_FILTER_SALE_ONLY]: "Распродажа",
  [CATALOG_FILTER_RENTAL_ONLY]: "Прокат и аренда",
  [CATALOG_FILTER_AFFILIATE_ONLY]: "Партнерская программа",
  [CATALOG_FILTER_WHOLESALE_ONLY]: "Оптовая цена",
  [CATALOG_FILTER_ORIGINAL_ONLY]: "Только оригинал",
};

export {
  PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS,
  PRODUCT_CARD_PREVIEW_FIELD_KEYS,
  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS,
  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS_STAFF,
  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS,
  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS_ADMIN,
  PRODUCT_FIELD_LABEL_RU,
  PRODUCT_FIELD_REGISTRY,
  PRODUCT_MODEL_FIELD_KEYS,
  getProductFieldEditKind,
  getProductFieldEditLabel,
  getProductFieldLabel,
  getProductFieldReadLayout,
  getProductFieldRegistryEntry,
} from "../lib/productFieldRegistry.js";
