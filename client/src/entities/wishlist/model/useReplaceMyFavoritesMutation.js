import { useMutation, useQueryClient } from "@tanstack/react-query";

import { replaceMyFavorites } from "../api/replaceMyFavorites.js";
import { wishlistQueryKeys } from "./wishlistQueryKeys.js";

export function useReplaceMyFavoritesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replaceMyFavorites,
    onSuccess: (saved) => {
      queryClient.setQueryData(wishlistQueryKeys.my(), saved);
    },
  });
}
