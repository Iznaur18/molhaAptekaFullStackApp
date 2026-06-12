import { apiClient, parseCategoryDisplaysData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchProductCategoryDisplays = async () => {
  try {
    const { data } = await apiClient.get("/product/category-displays");
    return parseCategoryDisplaysData(data);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_CATEGORY_DISPLAYS_FALLBACK),
    );
  }
};
