import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @typedef {'price' | 'stat' | 'block' | 'meta' | 'default'} ProductFieldReadLayout
 * @typedef {'text' | 'textarea' | 'number' | 'boolean' | 'category' | 'images' | 'video' | 'characteristics' | 'computed' | 'readonly'} ProductFieldEditKind
 *
 * @typedef {Object} ProductFieldRegistryEntry
 * @property {string} labelRu
 * @property {ProductFieldReadLayout} [readLayout]
 * @property {boolean} [multilineRead]
 * @property {string} [editLabel]
 * @property {ProductFieldEditKind} [editKind]
 * @property {boolean} [detailsTop]
 * @property {boolean} [detailsBottom]
 * @property {boolean} [detailsBottomStaffOnly]
 * @property {boolean} [detailsHideWhenEmpty]
 */

/** @type {Record<string, ProductFieldRegistryEntry>} */
export const PRODUCT_FIELD_REGISTRY = {
  _id: {
    labelRu: "ID",
    readLayout: "meta",
    editKind: "readonly",
    detailsBottom: true,
    detailsBottomStaffOnly: true,
  },
  productName: {
    labelRu: "Название",
    editLabel: CREATE_PRODUCT_MODAL_UI.LABEL_NAME,
    editKind: "text",
  },
  productDescription: {
    labelRu: "Описание",
    editLabel: CREATE_PRODUCT_MODAL_UI.LABEL_DESCRIPTION,
    readLayout: "block",
    multilineRead: true,
    editKind: "textarea",
    detailsBottom: true,
    detailsHideWhenEmpty: true,
  },
  productImageUrls: {
    labelRu: "Фото (URL)",
    editLabel: CREATE_PRODUCT_MODAL_UI.LABEL_IMAGE_URLS,
    readLayout: "block",
    multilineRead: true,
    editKind: "images",
    detailsBottomStaffOnly: true,
    detailsHideWhenEmpty: true,
  },
  productPreviewVideoUrl: {
    labelRu: "Превью-видео (URL)",
    editKind: "video",
  },
  productPrice: {
    labelRu: "Цена",
    editLabel: CREATE_PRODUCT_MODAL_UI.LABEL_PRICE,
    readLayout: "price",
    editKind: "number",
    detailsTop: true,
  },
  productOldPrice: {
    labelRu: "Старая цена",
    editLabel: CREATE_PRODUCT_MODAL_UI.LABEL_OLD_PRICE,
    editKind: "number",
  },
  productSeller: {
    labelRu: "Продавец",
    editKind: "readonly",
  },
  productCategory: {
    labelRu: "Категория",
    editLabel: CREATE_PRODUCT_MODAL_UI.LABEL_CATEGORY,
    readLayout: "stat",
    editKind: "category",
    detailsTop: true,
  },
  productSaleCity: {
    labelRu: CREATE_PRODUCT_MODAL_UI.LABEL_SALE_CITY,
    editLabel: CREATE_PRODUCT_MODAL_UI.LABEL_SALE_CITY,
    readLayout: "stat",
    editKind: "text",
    detailsTop: true,
  },
  productIsAvailable: {
    labelRu: "В наличии",
    editLabel: CREATE_PRODUCT_MODAL_UI.LABEL_AVAILABLE,
    editKind: "boolean",
  },
  productStockQuantity: {
    labelRu: "В наличии (шт.)",
    editLabel: CREATE_PRODUCT_MODAL_UI.LABEL_STOCK_QUANTITY,
    readLayout: "stat",
    editKind: "number",
    detailsTop: true,
  },
  productAuctionEnabled: {
    labelRu: "Аукцион",
    editLabel: CREATE_PRODUCT_MODAL_UI.LABEL_AUCTION,
    editKind: "boolean",
  },
  loyaltyPointsPerUnit: {
    labelRu: "Баллов за 1 шт.",
    editLabel: CREATE_PRODUCT_MODAL_UI.LABEL_LOYALTY_POINTS_PER_UNIT,
    editKind: "number",
  },
  productCharacteristics: {
    labelRu: "Характеристики",
    editLabel: CREATE_PRODUCT_MODAL_UI.LABEL_CHARACTERISTICS,
    editKind: "characteristics",
  },
  productModerationStatus: {
    labelRu: "Статус модерации",
    editKind: "readonly",
  },
  productModerationComment: {
    labelRu: "Комментарий модератора",
    readLayout: "block",
    multilineRead: true,
    editKind: "readonly",
  },
  uniqueViewerCount: {
    labelRu: "Просмотры",
    readLayout: "stat",
    editKind: "computed",
    detailsTop: true,
  },
  productWishlistCount: {
    labelRu: "В желаниях",
    readLayout: "stat",
    editKind: "computed",
    detailsTop: true,
  },
  soldQuantity: {
    labelRu: "Продано",
    readLayout: "stat",
    editKind: "computed",
    detailsTop: true,
  },
  createdAt: {
    labelRu: "Создан",
    readLayout: "meta",
    editKind: "readonly",
    detailsBottom: true,
  },
  updatedAt: {
    labelRu: "Обновлён",
    readLayout: "meta",
    editKind: "readonly",
    detailsBottom: true,
  },
};

const DETAILS_TOP_ROW_ORDER = [
  "productPrice",
  "productCategory",
  "productSaleCity",
  "productStockQuantity",
  "soldQuantity",
  "uniqueViewerCount",
  "productWishlistCount",
];

const DETAILS_BOTTOM_ROW_ORDER = ["productDescription", "_id", "createdAt", "updatedAt"];

const DETAILS_BOTTOM_ROW_STAFF_ORDER = [
  "productDescription",
  "productImageUrls",
  "_id",
  "createdAt",
  "updatedAt",
];

const MODEL_FIELD_ORDER = [
  "_id",
  "productName",
  "productDescription",
  "productImageUrls",
  "productPrice",
  "productSeller",
  "productCategory",
  "productSaleCity",
  "productIsAvailable",
  "uniqueViewerCount",
  "soldQuantity",
  "createdAt",
  "updatedAt",
];

const CARD_PREVIEW_ORDER = ["productPrice", "productSeller"];

const CARD_MODERATION_PREVIEW_ORDER = [
  "productPrice",
  "productSeller",
  "productDescription",
  "createdAt",
];

/** @type {Record<string, string>} */
export const PRODUCT_FIELD_LABEL_RU = Object.fromEntries(
  Object.entries(PRODUCT_FIELD_REGISTRY).map(([key, entry]) => [key, entry.labelRu]),
);

export const PRODUCT_MODEL_FIELD_KEYS = MODEL_FIELD_ORDER;
export const PRODUCT_CARD_PREVIEW_FIELD_KEYS = CARD_PREVIEW_ORDER;
export const PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS = CARD_MODERATION_PREVIEW_ORDER;
export const PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS = DETAILS_TOP_ROW_ORDER;
export const PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS_ADMIN = DETAILS_TOP_ROW_ORDER;
export const PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS = DETAILS_BOTTOM_ROW_ORDER;
export const PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS_STAFF = DETAILS_BOTTOM_ROW_STAFF_ORDER;

/**
 * @param {string} key
 */
export function getProductFieldRegistryEntry(key) {
  return PRODUCT_FIELD_REGISTRY[key] ?? null;
}

/**
 * @param {string} key
 */
export function getProductFieldLabel(key) {
  return PRODUCT_FIELD_REGISTRY[key]?.labelRu ?? key;
}

/**
 * @param {string} key
 */
export function getProductFieldEditLabel(key) {
  const entry = PRODUCT_FIELD_REGISTRY[key];
  if (!entry) {
    return key;
  }
  return entry.editLabel ?? entry.labelRu;
}

/**
 * @param {string} key
 * @returns {ProductFieldReadLayout}
 */
export function getProductFieldReadLayout(key) {
  return PRODUCT_FIELD_REGISTRY[key]?.readLayout ?? "default";
}

/**
 * @param {string} key
 */
export function isProductFieldMultilineRead(key) {
  return PRODUCT_FIELD_REGISTRY[key]?.multilineRead === true;
}

/**
 * @param {string} key
 * @returns {ProductFieldEditKind | null}
 */
export function getProductFieldEditKind(key) {
  return PRODUCT_FIELD_REGISTRY[key]?.editKind ?? null;
}

/**
 * @param {string} key
 */
export function getProductDetailsModalRowClassName(key) {
  const classes = ["product-details-modal__row"];
  const layout = getProductFieldReadLayout(key);

  if (layout === "price") {
    classes.push("product-details-modal__row--price");
  } else if (layout === "stat") {
    classes.push("product-details-modal__row--stat");
  } else if (layout === "block") {
    classes.push("product-details-modal__row--block");
  } else if (layout === "meta") {
    classes.push("product-details-modal__row--meta");
  }

  return classes.join(" ");
}

/**
 * @param {string} key
 */
export function getProductDetailsModalValueClassName(key) {
  return isProductFieldMultilineRead(key)
    ? "product-details-modal__value product-details-modal__value--multiline"
    : "product-details-modal__value";
}
