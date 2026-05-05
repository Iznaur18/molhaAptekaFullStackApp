/** Совпадает с `enum` в `server/models/ProductModel.js`. */
export const PRODUCT_CATEGORY_ELECTRONICS = "electronics";
export const PRODUCT_CATEGORY_CLOTHING = "clothing";
export const PRODUCT_CATEGORY_FOOD = "food";

export const PRODUCT_CATEGORIES = [
  PRODUCT_CATEGORY_ELECTRONICS,
  PRODUCT_CATEGORY_CLOTHING,
  PRODUCT_CATEGORY_FOOD,
];

export const PRODUCT_IMAGE_PLACEHOLDER_URL =
  "https://i.pinimg.com/1200x/cf/31/72/cf31727d3087cab8733545c4c4bbd566.jpg";

/** Подписи для UI (сервер отдаёт только ключ enum). */
export const PRODUCT_CATEGORY_LABEL_RU = {
  [PRODUCT_CATEGORY_ELECTRONICS]: "Электроника",
  [PRODUCT_CATEGORY_CLOTHING]: "Одежда",
  [PRODUCT_CATEGORY_FOOD]: "Продукты",
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
  "productImageUrl",
  "productPrice",
  "productSeller",
  "productCategory",
  "productIsAvailable",
  "createdAt",
  "updatedAt",
];

/** Подписи строк в карточке (ключ поля → подпись). */
export const PRODUCT_FIELD_LABEL_RU = {
  _id: "_id",
  productName: "productName",
  productDescription: "productDescription",
  productImageUrl: "productImageUrl",
  productPrice: "productPrice",
  productSeller: "productSeller",
  productCategory: "productCategory",
  productIsAvailable: "productIsAvailable",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};
