import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { FaqItemLinkFromApi } from "../model/types";

export type PatchFaqItemLinkPayload = {
  href?: string | null;
  resetHref?: boolean;
};

export const patchFaqItemLink = async (
  itemId: string,
  payload: PatchFaqItemLinkPayload,
): Promise<FaqItemLinkFromApi> => {
  try {
    const { data } = await apiClient.patch(`/faq/item-links/${itemId}`, payload);
    if (!data?.success || !data.data?.link) {
      throw new Error(API_CLIENT_UI.PATCH_FAQ_ITEM_LINK_FALLBACK);
    }
    return data.data.link as FaqItemLinkFromApi;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.PATCH_FAQ_ITEM_LINK_FALLBACK));
  }
};
