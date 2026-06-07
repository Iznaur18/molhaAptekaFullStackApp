import { useMutation } from "@tanstack/react-query";

import { createProductSearchSynonymAdmin } from "../api/createProductSearchSynonymAdmin.js";
import { deleteProductSearchSynonymAdmin } from "../api/deleteProductSearchSynonymAdmin.js";
import { patchProductSearchSynonymAdmin } from "../api/patchProductSearchSynonymAdmin.js";

export function useProductSearchSynonymAdminMutations() {
  const createMutation = useMutation({
    mutationFn: createProductSearchSynonymAdmin,
  });

  const patchMutation = useMutation({
    mutationFn: ({ synonymId, body }) => patchProductSearchSynonymAdmin(synonymId, body),
  });

  const deleteMutation = useMutation({
    mutationFn: (synonymId) => deleteProductSearchSynonymAdmin(synonymId),
  });

  return {
    createMutation,
    patchMutation,
    deleteMutation,
  };
}
