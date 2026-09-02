import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { FaqItemLinkFromApi } from "../model/types";

export const fetchFaqItemLinks = async (): Promise<FaqItemLinkFromApi[]> => {
  try {
    const { data } = await apiClient.get("/faq/item-links");
    if (!data?.success || !Array.isArray(data.data?.links)) {
      throw new Error(API_CLIENT_UI.FETCH_FAQ_ITEM_LINKS_FALLBACK);
    }
    return data.data.links as FaqItemLinkFromApi[];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_FAQ_ITEM_LINKS_FALLBACK));
  }
};
