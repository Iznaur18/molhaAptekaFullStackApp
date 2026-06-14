import { useQuery } from "@tanstack/react-query";

import { raffleQueryKeys } from "@/shared/api";

import { fetchRaffleProducts } from "../api/fetchRaffleProducts";

export const useRaffleProductsQuery = (raffleId: string, enabled = true) =>
  useQuery({
    queryKey: raffleQueryKeys.products(raffleId),
    queryFn: () => fetchRaffleProducts(raffleId),
    enabled: Boolean(raffleId) && enabled,
  });
