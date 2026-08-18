import {
  buildYandexMapsWebUrl,
  formatIsoDateTime,
  getProductNonEmptyCharacteristics,
} from "@izibuy/shared-lib";

import {
  COMMON_UI,
  CREATE_PRODUCT_MODAL_UI,
  FORMAT_BOOLEAN_RU,
  PRODUCT_MODERATION_PAGE_UI,
  PRODUCT_PICKUP_UI,
} from "../../../shared/config/appUiCopy.js";
import { formatProductFieldForDisplay } from "./formatProductFieldForDisplay.js";
import { resolveProductListingOriginLabel } from "./productListingOrigin.js";
import { resolveProductImageUrls } from "./resolveProductImageUrls.js";
import { resolveProductLoyaltyPointsPerUnit } from "./resolveProductLoyaltyPointsPerUnit.js";

/**
 * @param {unknown} value
 * @returns {number | null}
 */
function toFiniteCoord(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {unknown} seller
 */
function asPopulatedSeller(seller) {
  if (seller != null && typeof seller === "object" && seller._id != null) {
    return seller;
  }
  return null;
}

/**
 * @param {boolean} value
 */
function formatYesNo(value) {
  return value ? FORMAT_BOOLEAN_RU.YES : FORMAT_BOOLEAN_RU.NO;
}

/**
 * Read-model всех полей создания для staff-модалки очереди модерации.
 *
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function buildProductModerationCreateDetails(product) {
  if (product == null || product._id == null) {
    return null;
  }

  const lat = toFiniteCoord(product.productPickupLat);
  const lon = toFiniteCoord(product.productPickupLon);
  const pickupAddress = String(product.productPickupAddress ?? "").trim();
  const pickupEnabled = product.productPickupEnabled !== false;
  const deliveryEnabled = product.productDeliveryEnabled === true;
  const returnEnabled = product.productReturnEnabled === true;
  const previewVideoUrl = String(product.productPreviewVideoUrl ?? "").trim();
  const description = String(product.productDescription ?? "").trim();
  const seller = asPopulatedSeller(product.productSeller);
  const coordsText =
    lat != null && lon != null
      ? PRODUCT_MODERATION_PAGE_UI.COORDS_VALUE(lat, lon)
      : null;
  const mapsUrl =
    (lat != null && lon != null) || pickupAddress
      ? buildYandexMapsWebUrl({ lat, lon, address: pickupAddress })
      : null;

  const categoryValue = formatProductFieldForDisplay("categoryBreadcrumbRu", product);
  const categoryFallback = formatProductFieldForDisplay("productCategory", product);

  return {
    productId: String(product._id),
    heading: formatProductFieldForDisplay("productName", product),
    imageUrls: resolveProductImageUrls(product),
    previewVideoUrl: previewVideoUrl || null,
    description,
    characteristics: getProductNonEmptyCharacteristics(product.productCharacteristics),
    returnTerms: returnEnabled
      ? getProductNonEmptyCharacteristics(product.productReturnTerms)
      : [],
    pickup: {
      enabled: pickupEnabled,
      address: pickupAddress,
      lat,
      lon,
      coordsText,
      mapsUrl,
    },
    deliveryEnabled,
    returnEnabled,
    seller,
    factRows: [
      {
        key: "listingOrigin",
        label: CREATE_PRODUCT_MODAL_UI.LABEL_LISTING_ORIGIN,
        value: resolveProductListingOriginLabel(product.productListingOrigin),
      },
      {
        key: "category",
        label: CREATE_PRODUCT_MODAL_UI.LABEL_CATEGORY,
        value:
          categoryValue !== COMMON_UI.EM_DASH ? categoryValue : categoryFallback,
      },
      {
        key: "region",
        label: CREATE_PRODUCT_MODAL_UI.LABEL_SALE_REGION,
        value: formatProductFieldForDisplay("productRegionCode", product),
      },
      {
        key: "saleCity",
        label: CREATE_PRODUCT_MODAL_UI.LABEL_SALE_CITY,
        value: formatProductFieldForDisplay("productSaleCity", product),
      },
      {
        key: "stock",
        label: CREATE_PRODUCT_MODAL_UI.LABEL_STOCK_QUANTITY,
        value: formatProductFieldForDisplay("productStockQuantity", product),
      },
      {
        key: "loyalty",
        label: CREATE_PRODUCT_MODAL_UI.LABEL_LOYALTY_POINTS_PER_UNIT,
        value: String(resolveProductLoyaltyPointsPerUnit(product)),
      },
      {
        key: "pickupEnabled",
        label: PRODUCT_PICKUP_UI.FULFILLMENT_PICKUP,
        value: formatYesNo(pickupEnabled),
      },
      {
        key: "deliveryEnabled",
        label: PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY,
        value: formatYesNo(deliveryEnabled),
      },
      {
        key: "returnEnabled",
        label: CREATE_PRODUCT_MODAL_UI.LABEL_RETURN_ENABLED,
        value: formatYesNo(returnEnabled),
      },
      {
        key: "previewVideo",
        label: PRODUCT_MODERATION_PAGE_UI.VIDEO_LABEL,
        value: formatYesNo(Boolean(previewVideoUrl)),
      },
      {
        key: "createdAt",
        label: PRODUCT_MODERATION_PAGE_UI.CREATED_LABEL,
        value: formatProductFieldForDisplay("createdAt", product),
      },
    ],
    sellerFactRows: seller
      ? [
          {
            key: "premium",
            label: PRODUCT_MODERATION_PAGE_UI.SELLER_PREMIUM_LABEL,
            value: formatYesNo(seller.isPremiumUser === true),
          },
          {
            key: "confirmed",
            label: PRODUCT_MODERATION_PAGE_UI.SELLER_CONFIRMED_LABEL,
            value: formatYesNo(seller.isUserDataConfirmed === true),
          },
          {
            key: "registeredAt",
            label: PRODUCT_MODERATION_PAGE_UI.SELLER_REGISTERED_LABEL,
            value: formatIsoDateTime(seller.createdAt ?? null),
          },
        ]
      : [],
  };
}
