import { patchMyProductBodySchema } from "@molha/api-contract";
import type { z } from "zod";

import { apiClient, parsePatchMyProductData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type PatchMyProductBody = z.infer<typeof patchMyProductBodySchema>;

type ProductFromApi = {
  _id: string;
  [key: string]: unknown;
};

const readRawPatchedProduct = (payload: unknown): ProductFromApi | null => {
  if (
    payload == null ||
    typeof payload !== "object" ||
    (payload as { success?: unknown }).success !== true
  ) {
    return null;
  }
  const data = (payload as { data?: unknown }).data;
  if (data == null || typeof data !== "object") {
    return null;
  }
  const product = (data as { product?: unknown }).product;
  if (product == null || typeof product !== "object") {
    return null;
  }
  const id = (product as { _id?: unknown })._id;
  if (id == null || String(id).trim() === "") {
    return null;
  }
  return product as ProductFromApi;
};

export const patchMyProduct = async (productId: string, body: PatchMyProductBody) => {
  try {
    const parsedBody = patchMyProductBodySchema.parse(body);
    const { data } = await apiClient.patch(`/product/${productId}`, parsedBody);
    try {
      const parsed = parsePatchMyProductData(data);
      return parsed.product;
    } catch (parseError) {
      const rawProduct = readRawPatchedProduct(data);
      if (rawProduct) {
        if (__DEV__) {
          const detail =
            parseError instanceof Error && parseError.cause
              ? String(parseError.cause)
              : parseError instanceof Error
                ? parseError.message
                : String(parseError);
          console.warn("[patchMyProduct] schema mismatch, using raw product", detail);
        }
        return rawProduct;
      }
      throw parseError;
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK));
  }
};
