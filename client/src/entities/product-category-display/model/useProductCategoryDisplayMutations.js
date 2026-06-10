import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchProductCatalogFeedTileDisplay } from "../api/patchProductCatalogFeedTileDisplay.js";
import { patchProductCategoryDisplay } from "../api/patchProductCategoryDisplay.js";
import { patchProductCategoryNodeDisplay } from "../api/patchProductCategoryNodeDisplay.js";
import { invalidateAllProductCategoryDisplayQueries } from "../lib/productCategoryDisplayQueryCache.js";

export function useProductCategoryDisplayMutations() {
  const queryClient = useQueryClient();

  const invalidateDisplays = () =>
    void invalidateAllProductCategoryDisplayQueries(queryClient);

  const patchCategoryMutation = useMutation({
    mutationFn: ({ categorySlug, body }) => patchProductCategoryDisplay(categorySlug, body),
    onSuccess: invalidateDisplays,
  });

  const patchCategoryNodeMutation = useMutation({
    mutationFn: ({ categoryId, body }) => patchProductCategoryNodeDisplay(categoryId, body),
    onSuccess: invalidateDisplays,
  });

  const patchFeedTileMutation = useMutation({
    mutationFn: ({ tileKey, body }) => patchProductCatalogFeedTileDisplay(tileKey, body),
    onSuccess: invalidateDisplays,
  });

  return {
    patchCategoryMutation,
    patchCategoryNodeMutation,
    patchFeedTileMutation,
  };
}
