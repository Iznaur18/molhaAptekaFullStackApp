import { useQuery } from "@tanstack/react-query";

import { raffleQueryKeys } from "@/shared/api";

import { fetchFeaturedRaffles } from "../api/fetchFeaturedRaffles";

export const useFeaturedRafflesQuery = (enabled = true) =>
  useQuery({
    queryKey: raffleQueryKeys.featured(),
    queryFn: fetchFeaturedRaffles,
    enabled,
  });
