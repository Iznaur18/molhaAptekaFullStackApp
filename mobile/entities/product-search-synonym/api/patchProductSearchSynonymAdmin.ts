import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { SearchSynonymRow } from "./searchSynonymAdminApi";

export type PatchSearchSynonymPayload = {
  token?: string;
  categories?: string[];
};

export const patchProductSearchSynonymAdmin = async (
  synonymId: string,
  payload: PatchSearchSynonymPayload,
): Promise<SearchSynonymRow> => {
  try {
    const { data } = await apiClient.patch(
      `/product/admin/search-synonyms/${synonymId}`,
      payload,
    );
    if (!data?.success || !data.data?.synonym) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.synonym as SearchSynonymRow;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось обновить синоним"));
  }
};
