import { useMutation, useQueryClient } from "@tanstack/react-query";

import { categoryDisplayQueryKeys } from "@/shared/api";

import { patchProductCatalogFeedTileDisplay } from "../api/patchProductCatalogFeedTileDisplay";
import { patchProductCategoryDisplay } from "../api/patchProductCategoryDisplay";
import { patchProductCategoryNodeDisplay } from "../api/patchProductCategoryNodeDisplay";
import {
  patchResolvedProductCategoryDisplay,
  type PatchCategoryDisplayBody,
} from "../lib/patchResolvedProductCategoryDisplay";
import type { ResolvedProductCategoryDisplay } from "../lib/resolveProductCategoryDisplay";

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
      body: PatchCategoryDisplayBody;
    }) => patchProductCategoryDisplay(categorySlug, body),
    onSuccess: () => invalidateDisplays(queryClient),
  });

  const patchCategoryNodeMutation = useMutation({
    mutationFn: ({
      categoryId,
      body,
    }: {
      categoryId: string;
      body: PatchCategoryDisplayBody;
    }) => patchProductCategoryNodeDisplay(categoryId, body),
    onSuccess: () => invalidateDisplays(queryClient),
  });

  const patchResolvedCategoryMutation = useMutation({
    mutationFn: ({
      resolved,
      body,
    }: {
      resolved: Pick<ResolvedProductCategoryDisplay, "categoryId" | "displaySlug">;
      body: PatchCategoryDisplayBody;
    }) => patchResolvedProductCategoryDisplay(resolved, body),
    onSuccess: () => invalidateDisplays(queryClient),
  });

  const patchFeedTileMutation = useMutation({
    mutationFn: ({ tileKey, body }: { tileKey: string; body: PatchCategoryDisplayBody }) =>
      patchProductCatalogFeedTileDisplay(tileKey, body),
    onSuccess: () => invalidateDisplays(queryClient),
  });

  return {
    patchCategoryMutation,
    patchCategoryNodeMutation,
    patchResolvedCategoryMutation,
    patchFeedTileMutation,
  };
};
