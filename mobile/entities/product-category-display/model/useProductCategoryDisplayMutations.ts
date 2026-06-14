import { useMutation, useQueryClient } from "@tanstack/react-query";

import { categoryDisplayQueryKeys } from "@/shared/api";

import { patchProductCatalogFeedTileDisplay } from "../api/patchProductCatalogFeedTileDisplay";
import { patchProductCategoryDisplay } from "../api/patchProductCategoryDisplay";

type PatchDisplayBody = {
  customLabel?: string | null;
  imageUrl?: string | null;
  resetCustomLabel?: boolean;
  resetImageUrl?: boolean;
};

const invalidateDisplays = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: categoryDisplayQueryKeys.all });
};

export const useProductCategoryDisplayMutations = () => {
  const queryClient = useQueryClient();

  const patchCategoryMutation = useMutation({
    mutationFn: ({
      categorySlug,
      body,
    }: {
      categorySlug: string;
      body: PatchDisplayBody;
    }) => patchProductCategoryDisplay(categorySlug, body),
    onSuccess: () => invalidateDisplays(queryClient),
  });

  const patchFeedTileMutation = useMutation({
    mutationFn: ({ tileKey, body }: { tileKey: string; body: PatchDisplayBody }) =>
      patchProductCatalogFeedTileDisplay(tileKey, body),
    onSuccess: () => invalidateDisplays(queryClient),
  });

  return {
    patchCategoryMutation,
    patchFeedTileMutation,
  };
};
