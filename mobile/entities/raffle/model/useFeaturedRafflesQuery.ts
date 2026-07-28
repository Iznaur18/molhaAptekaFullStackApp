import { useQuery } from "@tanstack/react-query";

import { raffleQueryKeys } from "@/shared/api";

import { fetchFeaturedRaffles } from "../api/fetchFeaturedRaffles";

export const useFeaturedRafflesQuery = ({
  enabled = true,
  regionCode = "",
}: { enabled?: boolean; regionCode?: string } = {}) =>
  useQuery({
    queryKey: raffleQueryKeys.featured(regionCode),
    queryFn: () => fetchFeaturedRaffles({ regionCode: regionCode || undefined }),
    enabled,
  });
