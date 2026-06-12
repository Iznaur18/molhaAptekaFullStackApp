import { apiClient, parseCatalogProductByIdData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchCatalogProductById = async (productId: string) => {
  try {
    const { data } = await apiClient.get(`/product/${productId}/catalog`);
    return parseCatalogProductByIdData(data);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK),
    );
  }
};
