import { patchMyProductBodySchema } from "@molha/api-contract";
import type { z } from "zod";

import { apiClient, parsePatchMyProductData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type PatchMyProductBody = z.infer<typeof patchMyProductBodySchema>;

export const patchMyProduct = async (productId: string, body: PatchMyProductBody) => {
  try {
    const parsedBody = patchMyProductBodySchema.parse(body);
    const { data } = await apiClient.patch(`/product/${productId}`, parsedBody);
    const parsed = parsePatchMyProductData(data);
    return parsed.product;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK));
  }
};
