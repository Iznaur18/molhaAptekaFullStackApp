import { useQuery } from "@tanstack/react-query";

import { fetchFeaturedRaffles } from "../api/fetchFeaturedRaffle.js";
import { fetchPendingRaffles } from "../api/fetchPendingRaffles.js";
import { raffleQueryKeys } from "./raffleQueryKeys.js";

const LIVE_SITE_STATUSES = new Set(["active", "paused", "completed"]);

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useStaffRafflesQueueQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: raffleQueryKeys.staffQueue(),
    enabled,
    queryFn: async () => {
      const [pendingRaffles, featuredList] = await Promise.all([
        fetchPendingRaffles(),
        fetchFeaturedRaffles(),
      ]);

      const liveRaffle =
        featuredList.find((row) => row.status === "active") ??
        featuredList.find((row) => LIVE_SITE_STATUSES.has(row.status)) ??
        null;

      return {
        pendingRaffles,
        liveRaffle:
          liveRaffle && LIVE_SITE_STATUSES.has(liveRaffle.status) ? liveRaffle : null,
      };
    },
  });
}
