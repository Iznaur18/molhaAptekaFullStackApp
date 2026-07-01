import { useMutation, useQuery } from "@tanstack/react-query";

import { createProductSearchSynonymAdmin } from "@/entities/product-search-synonym/api/createProductSearchSynonymAdmin";
import { deleteProductSearchSynonymAdmin } from "@/entities/product-search-synonym/api/searchSynonymAdminApi";
import { fetchProductSearchSynonymsAdmin } from "@/entities/product-search-synonym/api/searchSynonymAdminApi";
import { patchProductSearchSynonymAdmin } from "@/entities/product-search-synonym/api/patchProductSearchSynonymAdmin";
import { searchSynonymAdminQueryKeys } from "@/shared/api";

export const useProductSearchSynonymsAdminQuery = (enabled = true) =>
  useQuery({
    queryKey: searchSynonymAdminQueryKeys.all,
    queryFn: fetchProductSearchSynonymsAdmin,
    enabled,
  });

export const useProductSearchSynonymAdminMutations = () => {
  const createMutation = useMutation({
    mutationFn: createProductSearchSynonymAdmin,
  });

  const patchMutation = useMutation({
    mutationFn: ({
      synonymId,
      body,
    }: {
      synonymId: string;
      body: { token?: string; categories?: string[] };
    }) => patchProductSearchSynonymAdmin(synonymId, body),
  });

  const deleteMutation = useMutation({
    mutationFn: (synonymId: string) => deleteProductSearchSynonymAdmin(synonymId),
  });

  return { createMutation, patchMutation, deleteMutation };
};
