import { apiClient } from "../../../shared/api/index.js";
import { parseCreateProductData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";
import {
  PRODUCT_FULFILLMENT_SOURCE_CUSTOM,
  PRODUCT_FULFILLMENT_SOURCE_PROFILE,
} from "@molha/api-contract";

/** @typedef {import('@molha/api-contract/types').CreateProductBodyContract} CreateProductBody */

/**
 * `POST /product` — создать товар (Bearer).
 *
 * @param {CreateProductBody} body
 * @returns {Promise<import('../model/types.js').ProductFromApi>}
 */
export async function createProduct(body) {
  try {
    const payload = {
      productName: body.productName.trim(),
      productDescription: body.productDescription.trim(),
      productPrice: body.productPrice,
      productOldPrice: body.productOldPrice ?? null,
      productIsAvailable: body.productIsAvailable,
      productListingOrigin: body.productListingOrigin,
      productIsOriginal: body.productIsOriginal === true,
    };
    if (body.productCategoryId) {
      payload.productCategoryId = body.productCategoryId;
    }
    if (body.productCategory) {
      payload.productCategory = body.productCategory;
    }
    if (body.productIsAvailable === true) {
      payload.productStockQuantity = body.productStockQuantity;
    }
    if (body.productAuctionEnabled != null) {
      payload.productAuctionEnabled = body.productAuctionEnabled === true;
    }
    const loyaltyParsed = Math.floor(Number(body.loyaltyPointsPerUnit));
    if (Number.isFinite(loyaltyParsed) && loyaltyParsed >= 0) {
      payload.loyaltyPointsPerUnit = loyaltyParsed;
    }
    const urls = Array.isArray(body.productImageUrls)
      ? body.productImageUrls.map((s) => String(s).trim()).filter(Boolean)
      : [];
    if (urls.length > 0) {
      payload.productImageUrls = urls;
    }
    const previewVideo = body.productPreviewVideoUrl?.trim();
    if (previewVideo) {
      payload.productPreviewVideoUrl = previewVideo;
    }
    const instagramPostUrl = body.productInstagramPostUrl?.trim();
    if (instagramPostUrl) {
      payload.productInstagramPostUrl = instagramPostUrl;
    }
    if (Array.isArray(body.productCharacteristics)) {
      payload.productCharacteristics = body.productCharacteristics;
    }
    // Товар, следующий профилю продавца, НЕ шлёт ни адрес, ни флаги: их
    // подставит сервер, а присланные рядом с источником схема отклоняет —
    // чтобы адрес не пропадал молча. Всё остальное (возврат, картинки)
    // отправляется как обычно, поэтому здесь ветвление, а не ранний выход.
    const followsSellerProfile =
      body.productFulfillmentSource === PRODUCT_FULFILLMENT_SOURCE_PROFILE;
    payload.productFulfillmentSource = followsSellerProfile
      ? PRODUCT_FULFILLMENT_SOURCE_PROFILE
      : PRODUCT_FULFILLMENT_SOURCE_CUSTOM;

    if (!followsSellerProfile) {
      const saleRegion = body.productRegionCode?.trim();
      if (saleRegion) {
        payload.productRegionCode = saleRegion;
      }
      const pickupLocations = Array.isArray(body.productPickupLocations)
        ? body.productPickupLocations
        : [];
      if (pickupLocations.length > 0) {
        payload.productPickupLocations = pickupLocations;
      } else {
        const pickupAddress = body.productPickupAddress?.trim();
        if (pickupAddress) {
          payload.productPickupAddress = pickupAddress;
        }
        if (
          body.productPickupLat != null &&
          Number.isFinite(Number(body.productPickupLat))
        ) {
          payload.productPickupLat = Number(body.productPickupLat);
        }
        if (
          body.productPickupLon != null &&
          Number.isFinite(Number(body.productPickupLon))
        ) {
          payload.productPickupLon = Number(body.productPickupLon);
        }
      }
      payload.productDeliveryEnabled = body.productDeliveryEnabled === true;
      payload.productPickupEnabled = body.productPickupEnabled !== false;
      // Перевозчик — источник правды на сервере, и без него выбор «Курьеры
      // Gitorg» или «ЛОБО» на шаге доставки терялся: белый список payload его
      // не переносил, и товар создавался как «везёт продавец» либо вовсе без
      // доставки.
      payload.productCourierDeliveryEnabled =
        body.productCourierDeliveryEnabled === true;
      const deliveryCarrier = body.productDeliveryCarrier?.trim();
      if (deliveryCarrier) {
        payload.productDeliveryCarrier = deliveryCarrier;
      }
    }

    if (body.productReturnEnabled != null) {
      payload.productReturnEnabled = body.productReturnEnabled === true;
      payload.productReturnTerms =
        payload.productReturnEnabled && Array.isArray(body.productReturnTerms)
          ? body.productReturnTerms
          : [];
    }
    const legacy = body.productImageUrl?.trim();
    if (legacy && urls.length === 0) {
      payload.productImageUrl = legacy;
    }

    const { data } = await apiClient.post("/product", payload);
    const parsed = parseCreateProductData(data);
    return parsed.product;
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.CREATE_PRODUCT_FALLBACK));
  }
}
