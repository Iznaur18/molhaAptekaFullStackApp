import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type BoostHomeProduct = Record<string, unknown> & {
  _id: string;
  productName?: string;
  productPrice?: unknown;
  productSeller?: string | { _id?: string } | null;
};

export const fetchProductPromotionBoostProducts = async ({
  regionCode,
}: { regionCode?: string } = {}): Promise<BoostHomeProduct[]> => {
  try {
    const { data } = await apiClient.get("/product/promotions/boost-products", {
      params: regionCode ? { regionCode } : undefined,
    });
    if (!data?.success || !Array.isArray(data.data?.products)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.products as BoostHomeProduct[];
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(
        error,
        API_CLIENT_UI.FETCH_PRODUCT_PROMOTION_BOOST_PRODUCTS_FALLBACK,
      ),
    );
  }
};
