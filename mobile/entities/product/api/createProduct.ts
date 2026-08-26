import { createProductBodySchema } from "@molha/api-contract";
import type { z } from "zod";

import { apiClient, parseCreateProductData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

/**
 * `z.input`, а не `z.infer`: схему парсит сама `createProduct` ниже, поэтому
 * вызывающая сторона отдаёт «сырое» тело и вправе не передавать поля с
 * `.default()` (productOutOfStock, productOutOfStockLabel и т.п.).
 */
export type CreateProductBody = z.input<typeof createProductBodySchema>;

export const createProduct = async (body: CreateProductBody) => {
  try {
    const parsedBody = createProductBodySchema.parse(body);
    const payload: Record<string, unknown> = {
      productName: parsedBody.productName.trim(),
      productDescription: parsedBody.productDescription.trim(),
      productPrice: parsedBody.productPrice,
      productIsAvailable: parsedBody.productIsAvailable,
      productListingOrigin: parsedBody.productListingOrigin,
      productIsOriginal: parsedBody.productIsOriginal === true,
      productCategoryId: parsedBody.productCategoryId,
    };

    if (parsedBody.productCategory) {
      payload.productCategory = parsedBody.productCategory;
    }

    if (parsedBody.productOldPrice != null) {
      payload.productOldPrice = parsedBody.productOldPrice;
    }

    if (parsedBody.productIsAvailable === true) {
      payload.productStockQuantity = parsedBody.productStockQuantity;
    }

    const urls = Array.isArray(parsedBody.productImageUrls)
      ? parsedBody.productImageUrls.map((url) => String(url).trim()).filter(Boolean)
      : [];
    if (urls.length > 0) {
      payload.productImageUrls = urls;
    }

    const previewVideoUrl = String(parsedBody.productPreviewVideoUrl ?? "").trim();
    if (previewVideoUrl) {
      payload.productPreviewVideoUrl = previewVideoUrl;
    }

    const saleRegion = String(parsedBody.productRegionCode ?? "").trim();
    if (saleRegion) {
      payload.productRegionCode = saleRegion;
    }

    if (
      parsedBody.loyaltyPointsPerUnit != null &&
      parsedBody.loyaltyPointsPerUnit > 0
    ) {
      payload.loyaltyPointsPerUnit = parsedBody.loyaltyPointsPerUnit;
    }

    const characteristics = Array.isArray(parsedBody.productCharacteristics)
      ? parsedBody.productCharacteristics.filter(
          (row) => row.key.trim() && row.value.trim(),
        )
      : [];
    if (characteristics.length > 0) {
      payload.productCharacteristics = characteristics;
    }

    payload.productReturnEnabled = parsedBody.productReturnEnabled === true;
    if (payload.productReturnEnabled) {
      const returnTerms = Array.isArray(parsedBody.productReturnTerms)
        ? parsedBody.productReturnTerms.filter(
            (row) => row.key.trim() && row.value.trim(),
          )
        : [];
      payload.productReturnTerms = returnTerms;
    } else {
      payload.productReturnTerms = [];
    }

    payload.productPickupAddress = parsedBody.productPickupAddress;
    if (parsedBody.productPickupLat != null) {
      payload.productPickupLat = parsedBody.productPickupLat;
    }
    if (parsedBody.productPickupLon != null) {
      payload.productPickupLon = parsedBody.productPickupLon;
    }
    // Точки самовывоза шлём только когда они заданы: пустой массив контракт
    // трактует как «точек нет», а не как «не менять».
    if (Array.isArray(parsedBody.productPickupLocations) && parsedBody.productPickupLocations.length > 0) {
      payload.productPickupLocations = parsedBody.productPickupLocations;
    }
    payload.productDeliveryEnabled = parsedBody.productDeliveryEnabled === true;
    payload.productPickupEnabled = parsedBody.productPickupEnabled !== false;

    const { data } = await apiClient.post("/product", payload);
    const parsed = parseCreateProductData(data);
    return parsed.product;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.CREATE_PRODUCT_FALLBACK));
  }
};
