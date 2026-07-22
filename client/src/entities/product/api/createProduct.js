import { apiClient } from "../../../shared/api/index.js";
import { parseCreateProductData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

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
    if (Array.isArray(body.productCharacteristics)) {
      payload.productCharacteristics = body.productCharacteristics;
    }
    const saleCity = body.productSaleCity?.trim();
    if (saleCity) {
      payload.productSaleCity = saleCity;
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
