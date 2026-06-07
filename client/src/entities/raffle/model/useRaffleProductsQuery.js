import { useQuery } from "@tanstack/react-query";

import { fetchRaffleProducts } from "../api/fetchRaffleProducts.js";
import { raffleQueryKeys } from "./raffleQueryKeys.js";

const DEFAULT_RAFFLE_PRODUCTS_LIMIT = 60;

/**
 * @param {{ raffleId: string; limit?: number; enabled?: boolean }} params
 */
export function useRaffleProductsQuery({
  raffleId,
  limit = DEFAULT_RAFFLE_PRODUCTS_LIMIT,
  enabled = true,
}) {
  const params = { limit };

  return useQuery({
    queryKey: raffleQueryKeys.products(raffleId, params),
    enabled: enabled && Boolean(raffleId),
    queryFn: () => fetchRaffleProducts(raffleId, params),
  });
}
