/** Совпадает с `server/constants/productConstants.js`. */
export const PRODUCT_IMAGE_URLS_MAX = 5;

/** Совпадает с `enum` в `server/models/ProductModel.js`. */
export const PRODUCT_CATEGORY_ELECTRONICS = "electronics";
export const PRODUCT_CATEGORY_CLOTHING = "clothing";
export const PRODUCT_CATEGORY_FOOD = "food";
export const PRODUCT_CATEGORY_FIGURES = "figures";

export const PRODUCT_CATEGORIES = [
  PRODUCT_CATEGORY_ELECTRONICS,
  PRODUCT_CATEGORY_CLOTHING,
  PRODUCT_CATEGORY_FOOD,
  PRODUCT_CATEGORY_FIGURES,
];

export const PRODUCT_IMAGE_PLACEHOLDER_URL =
  "https://i.pinimg.com/1200x/cf/31/72/cf31727d3087cab8733545c4c4bbd566.jpg";

/** Подписи для UI (сервер отдаёт только ключ enum). */
export const PRODUCT_CATEGORY_LABEL_RU = {
  [PRODUCT_CATEGORY_ELECTRONICS]: "Электроника",
  [PRODUCT_CATEGORY_CLOTHING]: "Одежда",
  [PRODUCT_CATEGORY_FOOD]: "Продукты",
  [PRODUCT_CATEGORY_FIGURES]: "Фигурки",
};

/** Верхняя граница `limit` в `server/controllers/Product/getProducts.js`. */
export const PRODUCTS_FETCH_PAGE_LIMIT = 100;

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
  "createdAt",
  "updatedAt",
];

/** Поля превью на карточке каталога (остальное — в модалке). */
export const PRODUCT_CARD_PREVIEW_FIELD_KEYS = [
  "productPrice",
  "productCategory",
  "productSeller",
  "productIsAvailable",
];

/**
 * Верхний ряд модалки товара: слева квадратное фото, справа — эти поля.
 */
export const PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS = [
  "productPrice",
  "productCategory",
  "productSeller",
  "productIsAvailable",
];

/** Нижний ряд модалки: на всю ширину под верхним блоком. */
export const PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS = [
  "productDescription",
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
  createdAt: "Создан",
  updatedAt: "Обновлён",
};
