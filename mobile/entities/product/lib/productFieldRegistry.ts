export const PRODUCT_DETAILS_TOP_ROW_FIELD_KEYS = [
  "productCategory",
  "productSaleCity",
  "productStockQuantity",
  "soldQuantity",
  "uniqueViewerCount",
  "productWishlistCount",
] as const;

export const getProductFieldLabel = (key: string): string => {
  const labels: Record<string, string> = {
    productCategory: "Категория",
    productSaleCity: "Город",
    productStockQuantity: "В наличии (шт.)",
    soldQuantity: "Продано",
    uniqueViewerCount: "Просмотры",
    productWishlistCount: "В желаниях",
    productDescription: "Описание",
    createdAt: "Создан",
    updatedAt: "Обновлён",
  };
  return labels[key] ?? key;
};
