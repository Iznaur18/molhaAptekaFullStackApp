import { useQuery } from "@tanstack/react-query";

import { raffleQueryKeys } from "@/shared/api";

import { fetchRaffleById } from "../api/fetchRaffleById";

export const useRaffleByIdQuery = ({
  raffleId,
  enabled = true,
}: {
  raffleId: string;
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: raffleQueryKeys.detail(raffleId),
    enabled: enabled && Boolean(raffleId),
    queryFn: () => fetchRaffleById(raffleId),
  });
