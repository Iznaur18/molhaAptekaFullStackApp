import { sellerPersonalCategoryCatalogTilesDataSchema } from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { SELLER_PERSONAL_CATEGORY_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { SellerPersonalCategoryCatalogTile } from "@/entities/product-category-display/model/types";

export const fetchSellerPersonalCategoryCatalogTiles = async ({
  regionCode,
}: { regionCode?: string } = {}): Promise<SellerPersonalCategoryCatalogTile[]> => {
  try {
    const { data } = await apiClient.get("/seller-personal-category/catalog-tiles", {
      params: regionCode ? { regionCode } : undefined,
    });
    const parsed = parseApiContractData(data, sellerPersonalCategoryCatalogTilesDataSchema);
    return parsed.tiles as SellerPersonalCategoryCatalogTile[];
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, SELLER_PERSONAL_CATEGORY_PAGE_UI.FETCH_TILES_FALLBACK),
    );
  }
};
