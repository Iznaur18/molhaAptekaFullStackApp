import { useMutation } from "@tanstack/react-query";

import {
  addCuratedCategoryListItemAdmin,
  createCuratedCategoryListAdmin,
  deleteCuratedCategoryListAdmin,
  patchCuratedCategoryListAdmin,
  removeCuratedCategoryListItemAdmin,
  reorderCuratedCategoryListsAdmin,
} from "../api/curatedCategoryListAdminApi.js";

export function useCuratedCategoryListAdminMutations() {
  const createMutation = useMutation({
    mutationFn: createCuratedCategoryListAdmin,
  });

  const patchMutation = useMutation({
    mutationFn: ({ listId, body }) => patchCuratedCategoryListAdmin(listId, body),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCuratedCategoryListAdmin,
  });

  const reorderMutation = useMutation({
    mutationFn: reorderCuratedCategoryListsAdmin,
  });

  const addItemMutation = useMutation({
    mutationFn: ({ listId, kind, refId }) => addCuratedCategoryListItemAdmin(listId, kind, refId),
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ listId, itemKey }) => removeCuratedCategoryListItemAdmin(listId, itemKey),
  });

  return {
    createMutation,
    patchMutation,
    deleteMutation,
    reorderMutation,
    addItemMutation,
    removeItemMutation,
  };
}
