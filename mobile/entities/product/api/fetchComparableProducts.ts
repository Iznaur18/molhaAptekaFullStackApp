import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { CatalogGridProduct } from "@/features/catalog-grid/lib/buildCatalogGridRows";

/**
 * Похожие товары для вкладки «Сравнение». Порт
 * `client/src/entities/product/api/fetchComparableProducts.js`: ответ читается
 * вручную, без zod — как в вебе, отдельной схемы у эндпоинта нет.
 */
export const fetchComparableProducts = async (
  productId: string,
): Promise<CatalogGridProduct[]> => {
  const id = String(productId ?? "").trim();
  if (!id) {
    return [];
  }

  try {
    const { data } = await apiClient.get(`/product/${encodeURIComponent(id)}/compare`);
    const payload = data as { success?: unknown; data?: { products?: unknown } };
    if (payload?.success !== true || !Array.isArray(payload.data?.products)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return payload.data.products as CatalogGridProduct[];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_PRODUCTS_FALLBACK));
  }
};
