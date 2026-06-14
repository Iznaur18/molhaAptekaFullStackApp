import { createProductBodySchema } from "@molha/api-contract";
import type { z } from "zod";

import { apiClient, parseCreateProductData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type CreateProductBody = z.infer<typeof createProductBodySchema>;

export const createProduct = async (body: CreateProductBody) => {
  try {
    const parsedBody = createProductBodySchema.parse(body);
    const payload: Record<string, unknown> = {
      productName: parsedBody.productName.trim(),
      productDescription: parsedBody.productDescription.trim(),
      productPrice: parsedBody.productPrice,
      productOldPrice: parsedBody.productOldPrice ?? null,
      productIsAvailable: parsedBody.productIsAvailable,
      productCategoryId: parsedBody.productCategoryId,
    };

    if (parsedBody.productIsAvailable === true) {
      payload.productStockQuantity = parsedBody.productStockQuantity;
    }

    const urls = Array.isArray(parsedBody.productImageUrls)
      ? parsedBody.productImageUrls.map((url) => String(url).trim()).filter(Boolean)
      : [];
    if (urls.length > 0) {
      payload.productImageUrls = urls;
    }

    const { data } = await apiClient.post("/product", payload);
    const parsed = parseCreateProductData(data);
    return parsed.product;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.CREATE_PRODUCT_FALLBACK));
  }
};
