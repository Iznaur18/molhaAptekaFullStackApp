import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addCuratedProductListItemAdmin,
  createCuratedProductListAdmin,
  deleteCuratedProductListAdmin,
  patchCuratedProductListAdmin,
  removeCuratedProductListItemAdmin,
  reorderCuratedProductListsAdmin,
} from "@/entities/curated-product-list/api/curatedProductListAdminMutationsApi";
import { curatedProductListAdminQueryKeys, curatedProductListQueryKeys } from "@/shared/api";

export const useCuratedProductListAdminMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: curatedProductListAdminQueryKeys.all });
    void queryClient.invalidateQueries({ queryKey: curatedProductListQueryKeys.home() });
  };

  const createMutation = useMutation({
    mutationFn: createCuratedProductListAdmin,
    onSuccess: invalidate,
  });

  const patchMutation = useMutation({
    mutationFn: ({ listId, body }: { listId: string; body: { title?: string } }) =>
      patchCuratedProductListAdmin(listId, body),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCuratedProductListAdmin,
    onSuccess: invalidate,
  });

  const reorderMutation = useMutation({
    mutationFn: reorderCuratedProductListsAdmin,
    onSuccess: invalidate,
  });

  const addItemMutation = useMutation({
    mutationFn: ({ listId, productId }: { listId: string; productId: string }) =>
      addCuratedProductListItemAdmin(listId, productId),
    onSuccess: invalidate,
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ listId, productId }: { listId: string; productId: string }) =>
      removeCuratedProductListItemAdmin(listId, productId),
    onSuccess: invalidate,
  });

  return {
    createMutation,
    patchMutation,
    deleteMutation,
    reorderMutation,
    addItemMutation,
    removeItemMutation,
  };
};
