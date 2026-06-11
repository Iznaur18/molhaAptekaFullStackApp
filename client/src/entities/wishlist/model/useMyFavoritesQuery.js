import { useQuery } from "@tanstack/react-query";

import { fetchMyFavorites } from "../api/fetchMyFavorites.js";
import { wishlistQueryKeys } from "./wishlistQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useMyFavoritesQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: wishlistQueryKeys.my(),
    enabled,
    queryFn: fetchMyFavorites,
  });
}
