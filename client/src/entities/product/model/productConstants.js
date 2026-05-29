/** Совпадает с `server/constants/productConstants.js`. */
export const PRODUCT_IMAGE_URLS_MAX = 5;

export const SELLER_PRODUCTS_LIMIT_REGULAR = 15;
export const SELLER_PRODUCTS_LIMIT_PREMIUM = 30;
export const SELLER_PRODUCTS_LIMIT_ERROR_MESSAGE =
  "Достигнут лимит товаров: 15 для обычных пользователей, 30 для премиум.";

export const PRODUCT_DESCRIPTION_MAX_WORDS = 100;

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
export const PRODUCT_CATEGORY_FURNITURE = "furniture";
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
/** Устаревший slug (до расширения списка). */
export const PRODUCT_CATEGORY_FIGURES = "figures";

/** Порядок — для фильтра и формы создания товара. */
export const PRODUCT_CATEGORIES = [
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
  PRODUCT_CATEGORY_FURNITURE,
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
  PRODUCT_CATEGORY_FIGURES,
];

export const PRODUCT_IMAGE_PLACEHOLDER_URL =
  "https://i.pinimg.com/1200x/cf/31/72/cf31727d3087cab8733545c4c4bbd566.jpg";

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
  [PRODUCT_CATEGORY_FURNITURE]: "Мебель",
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
  [PRODUCT_CATEGORY_FIGURES]: "Фигурки",
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

/** Значения `<select>` каталога (не уходят в query `sort`). */
export const CATALOG_FILTER_FOLLOWING_ONLY = "__following_only__";
export const CATALOG_FILTER_AUCTION_ONLY = "__auction_only__";

export const CATALOG_SORT_OPTIONS = [
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_VIEWS,
  CATALOG_SORT_PURCHASES,
  CATALOG_SORT_PREMIUM,
  CATALOG_SORT_CONFIRMED,
];

/** Публичный каталог: сортировка + фильтры в одном меню. */
export const CATALOG_SELECT_OPTIONS = [
  ...CATALOG_SORT_OPTIONS,
  CATALOG_FILTER_FOLLOWING_ONLY,
  CATALOG_FILTER_AUCTION_ONLY,
];

/** Сортировки в «Мои товары» (без фильтра только премиум). */
export const CATALOG_SORT_OPTIONS_MY_PRODUCTS = [
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_VIEWS,
  CATALOG_SORT_PURCHASES,
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
  [CATALOG_FILTER_FOLLOWING_ONLY]: "Только от подписок",
  [CATALOG_FILTER_AUCTION_ONLY]: "Только с аукционом",
};

/**
 * Поля lean-документа Product: схема `server/models/ProductModel.js` + `timestamps`.
 * Порядок — для единообразного UI.
 */
export const PRODUCT_MODEL_FIELD_KEYS = [
  "_id",
  "productName",
  "productDescription",
  "productImageUrls",
  "productPrice",
  "productSeller",
  "productCategory",
  "productIsAvailable",
  "uniqueViewerCount",
  "soldQuantity",
  "createdAt",
  "updatedAt",
];

/** Поля превью на карточке каталога (остальное — в модалке). */
export const PRODUCT_CARD_PREVIEW_FIELD_KEYS = [
  "productPrice",
  "productCategory",
  "productSeller",
];

/** Поля на карточке в очереди «На модерации» (как каталог + описание и дата). */
export const PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS = [
  "productPrice",
  "productCategory",
  "productSeller",
  "productDescription",
  "createdAt",
];

/**
 * Верхний ряд модалки товара: слева квадратное фото, справа — эти поля.
 */
export const PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS = [
  "productPrice",
  "productCategory",
  "productStockQuantity",
  "soldQuantity",
  "uniqueViewerCount",
];

/** Верхний ряд модалки для admin / moderator (расширенный набор полей). */
export const PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS_ADMIN = [
  "productPrice",
  "productCategory",
  "productStockQuantity",
  "soldQuantity",
  "uniqueViewerCount",
];

/** Нижний ряд модалки: на всю ширину под верхним блоком. */
export const PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS = [
  "productDescription",
  "_id",
  "createdAt",
  "updatedAt",
];

/** Нижний ряд для admin / moderator: описание, ссылки на фото, служебные даты. */
export const PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS_STAFF = [
  "productDescription",
  "productImageUrls",
  "_id",
  "createdAt",
  "updatedAt",
];

/** Подписи полей в UI (модалка и таблица на карточке). */
export const PRODUCT_FIELD_LABEL_RU = {
  _id: "ID",
  productName: "Название",
  productDescription: "Описание",
  productImageUrls: "Фото (URL)",
  productPrice: "Цена",
  productSeller: "Продавец",
  productCategory: "Категория",
  productIsAvailable: "В наличии",
  productStockQuantity: "В наличии (шт.)",
  productModerationStatus: "Статус модерации",
  productModerationComment: "Комментарий модератора",
  uniqueViewerCount: "Просмотры",
  soldQuantity: "Продано",
  createdAt: "Создан",
  updatedAt: "Обновлён",
};
