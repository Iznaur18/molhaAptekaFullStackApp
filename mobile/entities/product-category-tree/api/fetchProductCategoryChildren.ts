import { apiClient, parseCategoryChildrenData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchProductCategoryChildren = async (categoryId: string) => {
  try {
    const { data } = await apiClient.get(`/product/categories/${categoryId}/children`);
    return parseCategoryChildrenData(data);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_CATEGORY_CHILDREN_FALLBACK),
    );
  }
};
