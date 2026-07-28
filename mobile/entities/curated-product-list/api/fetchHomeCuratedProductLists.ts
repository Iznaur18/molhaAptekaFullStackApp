import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type HomeCuratedProductList = {
  _id: string;
  title: string;
  regionCode?: string;
  products: Array<Record<string, unknown> & { _id: string }>;
};

export const fetchHomeCuratedProductLists = async ({
  regionCode,
}: { regionCode?: string } = {}) => {
  try {
    const { data } = await apiClient.get("/product/curated-lists/home", {
      params: regionCode ? { regionCode } : undefined,
    });
    if (!data?.success || !Array.isArray(data.data?.lists)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.lists as HomeCuratedProductList[];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить подборки товаров"));
  }
};
