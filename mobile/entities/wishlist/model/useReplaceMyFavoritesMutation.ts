import { useMutation, useQueryClient } from "@tanstack/react-query";

import { replaceMyFavorites } from "../api/replaceMyFavorites";
import { wishlistQueryKeys } from "./wishlistQueryKeys";

export const useReplaceMyFavoritesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replaceMyFavorites,
    onSuccess: (saved) => {
      queryClient.setQueryData(wishlistQueryKeys.my(), saved);
    },
  });
};
