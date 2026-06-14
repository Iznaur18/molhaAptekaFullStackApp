import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { ProductCatalogFeedTileDisplayFromApi } from "../lib/resolveCatalogFeedTileDisplay";

type PatchFeedTileDisplayBody = {
  customLabel?: string | null;
  imageUrl?: string | null;
  resetCustomLabel?: boolean;
  resetImageUrl?: boolean;
};

export const patchProductCatalogFeedTileDisplay = async (
  tileKey: string,
  body: PatchFeedTileDisplayBody,
): Promise<ProductCatalogFeedTileDisplayFromApi> => {
  try {
    const { data } = await apiClient.patch(
      `/product/catalog-feed-displays/${encodeURIComponent(tileKey)}`,
      body,
    );
    if (!data?.success || !data.data?.display) {
      throw new Error(API_CLIENT_UI.PATCH_CATALOG_FEED_DISPLAY_FALLBACK);
    }
    return data.data.display as ProductCatalogFeedTileDisplayFromApi;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.PATCH_CATALOG_FEED_DISPLAY_FALLBACK),
    );
  }
};
