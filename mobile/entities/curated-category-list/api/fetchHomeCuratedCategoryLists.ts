import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type HomeCuratedCategory = {
  kind: "tree" | "personal";
  refId: string;
  itemKey: string;
  label: string;
  imageUrl: string | null;
  categorySlug?: string | null;
  sellerId?: string | null;
};

export type HomeCuratedCategoryList = {
  _id: string;
  title: string;
  regionCode?: string;
  categories: HomeCuratedCategory[];
};

export const fetchHomeCuratedCategoryLists = async ({
  regionCode,
}: { regionCode?: string } = {}) => {
  try {
    const { data } = await apiClient.get("/product/curated-category-lists/home", {
      params: regionCode ? { regionCode } : undefined,
    });
    if (!data?.success || !Array.isArray(data.data?.lists)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.lists as HomeCuratedCategoryList[];
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, "Не удалось загрузить подборки категорий"),
    );
  }
};
