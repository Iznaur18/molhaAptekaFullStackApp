import { useQuery } from "@tanstack/react-query";

import { raffleQueryKeys } from "@/shared/api";

import { fetchRaffleProducts } from "../api/fetchRaffleProducts";

const DEFAULT_RAFFLE_PRODUCTS_LIMIT = 60;

export const useRaffleProductsQuery = ({
  raffleId,
  limit = DEFAULT_RAFFLE_PRODUCTS_LIMIT,
  enabled = true,
}: {
  raffleId: string;
  limit?: number;
  enabled?: boolean;
}) => {
  const params = { limit };

  return useQuery({
    queryKey: raffleQueryKeys.products(raffleId, params),
    enabled: enabled && Boolean(raffleId),
    queryFn: () => fetchRaffleProducts(raffleId, params),
  });
};
