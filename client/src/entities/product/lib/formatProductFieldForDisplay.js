import { formatProductDescriptionPlainText } from "@izibuy/shared-lib";
import { getRuRegionByCode } from "@molha/api-contract";

import { COMMON_UI, FORMAT_BOOLEAN_RU, PRODUCT_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { PRODUCT_CATEGORY_LABEL_RU } from "../model/productConstants.js";
import { getProductModerationBadgeLabel } from "./getProductModerationUi.js";
import { resolveProductImageUrls } from "./resolveProductImageUrls.js";

const RUBLE_FORMAT = new Intl.NumberFormat(COMMON_UI.LOCALE_RU, {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const DATE_FORMAT = new Intl.DateTimeFormat(COMMON_UI.LOCALE_RU, {
  dateStyle: "short",
  timeStyle: "short",
});

function formatIsoDate(iso) {
  if (iso == null || iso === "") return COMMON_UI.EM_DASH;
  try {
    return DATE_FORMAT.format(new Date(iso));
  } catch {
    return String(iso);
  }
}

function sellerDisplayNameOnly(seller) {
  if (seller == null) return COMMON_UI.EM_DASH;
  if (typeof seller === "string") return COMMON_UI.EM_DASH;
  if (typeof seller === "object") {
    const name = seller.userName;
    return typeof name === "string" && name.trim().length > 0
      ? name
      : COMMON_UI.EM_DASH;
  }
  return COMMON_UI.EM_DASH;
}

function isAbsoluteHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

/**
 * @param {string} key
 * @param {import('../model/types.js').ProductFromApi} product
 */
export function formatProductFieldForDisplay(key, product) {
  const raw = product[key];

  switch (key) {
    case "_id":
      return raw == null ? COMMON_UI.EM_DASH : String(raw);
    case "productDescription": {
      if (raw == null || raw === "") return COMMON_UI.EM_DASH;
      const plain = formatProductDescriptionPlainText(String(raw));
      return plain || COMMON_UI.EM_DASH;
    }
    case "productImageUrls": {
      const urls = resolveProductImageUrls(product);
      if (urls.length === 0) return COMMON_UI.EM_DASH;
      return `${urls.length} шт.`;
    }
    case "productImageUrl":
      return isAbsoluteHttpUrl(raw) ? raw.trim() : COMMON_UI.EM_DASH;
    case "productPrice":
      return typeof raw === "number" && Number.isFinite(raw)
        ? RUBLE_FORMAT.format(raw)
        : COMMON_UI.EM_DASH;
    case "productSeller":
      return sellerDisplayNameOnly(raw);
    case "productCategory": {
      const label = PRODUCT_CATEGORY_LABEL_RU[raw];
      return label ?? (raw == null ? COMMON_UI.EM_DASH : String(raw));
    }
    case "categoryBreadcrumbRu":
      return typeof raw === "string" && raw.trim() !== ""
        ? raw.trim()
        : COMMON_UI.EM_DASH;
    case "productSaleCity": {
      const city = raw == null ? "" : String(raw).trim();
      return city === "" ? PRODUCT_DETAILS_MODAL_UI.SALE_CITY_ALL : city;
    }
    case "productPickupAddress": {
      const address = raw == null ? "" : String(raw).trim();
      return address === "" ? PRODUCT_DETAILS_MODAL_UI.ADDRESS_EMPTY : address;
    }
    case "productRegionCode": {
      const code = raw == null ? "" : String(raw).trim();
      if (!code) return COMMON_UI.EM_DASH;
      return getRuRegionByCode(code)?.name ?? code;
    }
    case "uniqueViewerCount":
    case "productWishlistCount": {
      const n = Number(raw);
      return Number.isFinite(n) ? String(Math.max(0, Math.floor(n))) : "0";
    }
    case "soldQuantity": {
      const n = Number(raw);
      const units = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
      return `${units} шт.`;
    }
    case "productStockQuantity": {
      const n = Number(raw);
      const units = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
      return `${units} шт.`;
    }
    case "productIsAvailable":
      if (raw === true) return FORMAT_BOOLEAN_RU.YES;
      if (raw === false) return FORMAT_BOOLEAN_RU.NO;
      return COMMON_UI.EM_DASH;
    case "productModerationStatus":
      return getProductModerationBadgeLabel(product);
    case "productModerationComment": {
      const text = raw == null ? "" : String(raw).trim();
      return text === "" ? COMMON_UI.EM_DASH : text;
    }
    case "createdAt":
    case "updatedAt":
      return formatIsoDate(raw);
    case "productName":
      return raw == null || raw === "" ? COMMON_UI.EM_DASH : String(raw);
    default:
      return raw == null ? COMMON_UI.EM_DASH : String(raw);
  }
}
