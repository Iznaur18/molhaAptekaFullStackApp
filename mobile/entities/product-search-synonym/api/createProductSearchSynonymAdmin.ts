import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { SearchSynonymRow } from "./searchSynonymAdminApi";

export type CreateSearchSynonymPayload = {
  token: string;
  categories: string[];
};

export const createProductSearchSynonymAdmin = async (
  payload: CreateSearchSynonymPayload,
): Promise<SearchSynonymRow> => {
  try {
    const { data } = await apiClient.post("/product/admin/search-synonyms", payload);
    if (!data?.success || !data.data?.synonym) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.synonym as SearchSynonymRow;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось создать синоним"));
  }
};
