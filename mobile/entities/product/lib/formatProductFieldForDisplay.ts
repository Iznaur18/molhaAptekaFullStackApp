import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { formatIsoDateTime, formatPriceRub } from "@/shared/lib";

import { getProductSellerDisplayName } from "./getProductSellerDisplayName";
import { PRODUCT_CATEGORY_LABEL_RU } from "./productCategoryLabels";

export const PRODUCT_FIELD_EMPTY_DISPLAY = "—";
const EM_DASH = PRODUCT_FIELD_EMPTY_DISPLAY;

export const formatProductFieldForDisplay = (
  key: string,
  product: Record<string, unknown>,
): string => {
  const raw = product[key];

  switch (key) {
    case "productDescription":
      return raw == null || raw === "" ? EM_DASH : String(raw);
    case "productPrice":
      return typeof raw === "number" ? formatPriceRub(raw) : EM_DASH;
    case "productSeller":
      return getProductSellerDisplayName(product) || EM_DASH;
    case "productCategory": {
      const slug = raw == null ? "" : String(raw);
      return PRODUCT_CATEGORY_LABEL_RU[slug] ?? (slug || EM_DASH);
    }
    case "productSaleCity": {
      const city = raw == null ? "" : String(raw).trim();
      return city === "" ? PRODUCT_DETAILS_MODAL_UI.SALE_CITY_ALL : city;
    }
    case "uniqueViewerCount":
    case "productWishlistCount": {
      const n = Number(raw);
      return Number.isFinite(n) ? String(Math.max(0, Math.floor(n))) : "0";
    }
    case "soldQuantity":
    case "productStockQuantity": {
      const n = Number(raw);
      const units = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
      return `${units} шт.`;
    }
    case "createdAt":
    case "updatedAt":
      return typeof raw === "string" ? formatIsoDateTime(raw) : EM_DASH;
    default:
      return raw == null ? EM_DASH : String(raw);
  }
};
