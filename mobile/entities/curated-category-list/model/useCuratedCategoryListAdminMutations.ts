import { useMutation } from "@tanstack/react-query";

import {
  addCuratedCategoryListItemAdmin,
  createCuratedCategoryListAdmin,
  deleteCuratedCategoryListAdmin,
  patchCuratedCategoryListAdmin,
  removeCuratedCategoryListItemAdmin,
  reorderCuratedCategoryListsAdmin,
  type CuratedCategoryKind,
} from "../api/curatedCategoryListAdminApi";

export const useCuratedCategoryListAdminMutations = () => {
  const createMutation = useMutation({
    mutationFn: createCuratedCategoryListAdmin,
  });

  const patchMutation = useMutation({
    mutationFn: ({
      listId,
      body,
    }: {
      listId: string;
      body: { title?: string; regionCode?: string };
    }) => patchCuratedCategoryListAdmin(listId, body),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCuratedCategoryListAdmin,
  });

  const reorderMutation = useMutation({
    mutationFn: reorderCuratedCategoryListsAdmin,
  });

  const addItemMutation = useMutation({
    mutationFn: ({
      listId,
      kind,
      refId,
    }: {
      listId: string;
      kind: CuratedCategoryKind;
      refId: string;
    }) => addCuratedCategoryListItemAdmin(listId, kind, refId),
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ listId, itemKey }: { listId: string; itemKey: string }) =>
      removeCuratedCategoryListItemAdmin(listId, itemKey),
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
