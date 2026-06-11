import { useMutation } from "@tanstack/react-query";

import { addCuratedProductListItemAdmin } from "../api/addCuratedProductListItemAdmin.js";
import { createCuratedProductListAdmin } from "../api/createCuratedProductListAdmin.js";
import { deleteCuratedProductListAdmin } from "../api/deleteCuratedProductListAdmin.js";
import { patchCuratedProductListAdmin } from "../api/patchCuratedProductListAdmin.js";
import { removeCuratedProductListItemAdmin } from "../api/removeCuratedProductListItemAdmin.js";
import { reorderCuratedProductListsAdmin } from "../api/reorderCuratedProductListsAdmin.js";

export function useCuratedProductListAdminMutations() {
  const createMutation = useMutation({
    mutationFn: createCuratedProductListAdmin,
  });

  const patchMutation = useMutation({
    mutationFn: ({ listId, body }) => patchCuratedProductListAdmin(listId, body),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCuratedProductListAdmin,
  });

  const reorderMutation = useMutation({
    mutationFn: reorderCuratedProductListsAdmin,
  });

  const addItemMutation = useMutation({
    mutationFn: ({ listId, productId }) => addCuratedProductListItemAdmin(listId, productId),
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ listId, productId }) =>
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
}
