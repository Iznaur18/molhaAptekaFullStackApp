import { apiClient } from "@/shared/api";
import { SEARCH_SYNONYMS_ADMIN_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type SearchSynonymRow = {
  _id: string;
  token: string;
  categories: string[];
};

export const fetchProductSearchSynonymsAdmin = async () => {
  try {
    const { data } = await apiClient.get("/product/admin/search-synonyms");
    if (!data?.success || !Array.isArray(data.data?.synonyms)) {
      throw new Error(SEARCH_SYNONYMS_ADMIN_PAGE_UI.LOAD_ERROR);
    }
    return data.data.synonyms as SearchSynonymRow[];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, SEARCH_SYNONYMS_ADMIN_PAGE_UI.LOAD_ERROR));
  }
};

export const deleteProductSearchSynonymAdmin = async (synonymId: string) => {
  try {
    const { data } = await apiClient.delete(`/product/admin/search-synonyms/${synonymId}`);
    if (!data?.success) {
      throw new Error(SEARCH_SYNONYMS_ADMIN_PAGE_UI.LOAD_ERROR);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, SEARCH_SYNONYMS_ADMIN_PAGE_UI.LOAD_ERROR));
  }
};
