import { useQuery } from "@tanstack/react-query";

import { fetchMyFavorites } from "../api/fetchMyFavorites";
import { wishlistQueryKeys } from "./wishlistQueryKeys";

type UseMyFavoritesQueryOptions = {
  enabled?: boolean;
};

export const useMyFavoritesQuery = ({ enabled = true }: UseMyFavoritesQueryOptions = {}) =>
  useQuery({
    queryKey: wishlistQueryKeys.my(),
    queryFn: fetchMyFavorites,
    enabled,
  });
