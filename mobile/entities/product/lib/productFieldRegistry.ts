export type ProductFieldReadLayout = "price" | "stat" | "block" | "meta" | "default";

const FIELD_LAYOUTS: Record<string, ProductFieldReadLayout> = {
  productPrice: "price",
  productCategory: "stat",
  productRegionCode: "stat",
  productStockQuantity: "stat",
  soldQuantity: "stat",
  uniqueViewerCount: "stat",
  productWishlistCount: "stat",
  productDescription: "block",
  _id: "meta",
  createdAt: "meta",
  updatedAt: "meta",
};

export const PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS = [
  "productPrice",
  "productCategory",
  "productRegionCode",
  "productStockQuantity",
  "soldQuantity",
  "uniqueViewerCount",
  "productWishlistCount",
] as const;

export const PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS = [
  "productDescription",
  "_id",
  "createdAt",
  "updatedAt",
] as const;

export const PRODUCT_CARD_PREVIEW_FIELD_KEYS = ["productPrice", "productSeller"] as const;

export const PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS = [
  "productPrice",
  "productSeller",
  "productDescription",
  "createdAt",
] as const;

export const PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS_WITHOUT_PRICE =
  PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS.filter((key) => key !== "productPrice");

/** @deprecated use PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS without productPrice */
export const PRODUCT_DETAILS_TOP_ROW_FIELD_KEYS = [
  "productCategory",
  "productRegionCode",
  "productStockQuantity",
  "soldQuantity",
  "uniqueViewerCount",
  "productWishlistCount",
] as const;

export const getProductFieldReadLayout = (key: string): ProductFieldReadLayout =>
  FIELD_LAYOUTS[key] ?? "default";

export const isProductFieldMultilineRead = (key: string): boolean => key === "productDescription";

export const getProductFieldLabel = (key: string): string => {
  const labels: Record<string, string> = {
    productCategory: "Категория",
    productRegionCode: "Регион продажи",
    productStockQuantity: "В наличии (шт.)",
    soldQuantity: "Продано",
    uniqueViewerCount: "Просмотры",
    productWishlistCount: "В желаниях",
    productDescription: "Описание",
    productPrice: "Цена",
    productSeller: "Продавец",
    _id: "ID",
    createdAt: "Создан",
    updatedAt: "Обновлён",
  };
  return labels[key] ?? key;
};
