import { useMutation } from "@tanstack/react-query";

import {
  addCuratedProductListItemAdmin,
  createCuratedProductListAdmin,
  deleteCuratedProductListAdmin,
  patchCuratedProductListAdmin,
  removeCuratedProductListItemAdmin,
  reorderCuratedProductListsAdmin,
} from "@/entities/curated-product-list/api/curatedProductListAdminMutationsApi";

export const useCuratedProductListAdminMutations = () => {
  const createMutation = useMutation({
    mutationFn: createCuratedProductListAdmin,
  });

  const patchMutation = useMutation({
    mutationFn: ({
      listId,
      body,
    }: {
      listId: string;
      body: { title?: string; regionCode?: string };
    }) => patchCuratedProductListAdmin(listId, body),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCuratedProductListAdmin,
  });

  const reorderMutation = useMutation({
    mutationFn: reorderCuratedProductListsAdmin,
  });

  const addItemMutation = useMutation({
    mutationFn: ({ listId, productId }: { listId: string; productId: string }) =>
      addCuratedProductListItemAdmin(listId, productId),
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ listId, productId }: { listId: string; productId: string }) =>
      removeCuratedProductListItemAdmin(listId, productId),
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
