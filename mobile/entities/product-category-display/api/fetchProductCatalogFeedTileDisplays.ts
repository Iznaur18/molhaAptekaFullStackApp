import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { ProductCatalogFeedTileDisplayFromApi } from "../lib/resolveCatalogFeedTileDisplay";

export const fetchProductCatalogFeedTileDisplays = async (): Promise<
  ProductCatalogFeedTileDisplayFromApi[]
> => {
  try {
    const { data } = await apiClient.get("/product/catalog-feed-displays");
    if (!data?.success || !Array.isArray(data.data?.displays)) {
      throw new Error(API_CLIENT_UI.FETCH_CATALOG_FEED_DISPLAYS_FALLBACK);
    }
    return data.data.displays as ProductCatalogFeedTileDisplayFromApi[];
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_CATALOG_FEED_DISPLAYS_FALLBACK),
    );
  }
};
