import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type ProductCategoryBreadcrumbItem = {
  slug: string;
  labelRu: string;
};

export type ProductCategoryBreadcrumb = {
  categoryId: string;
  slug: string;
  labelRu: string;
  items: ProductCategoryBreadcrumbItem[];
};

export const fetchProductCategoryBreadcrumb = async (
  categoryId: string,
): Promise<{ breadcrumb: ProductCategoryBreadcrumb }> => {
  try {
    const { data } = await apiClient.get(`/product/categories/${categoryId}/breadcrumb`);

    if (!data?.success || !data.data?.breadcrumb) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return { breadcrumb: data.data.breadcrumb as ProductCategoryBreadcrumb };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_CATEGORY_BREADCRUMB_FALLBACK),
    );
  }
};
