import { raffleQueryKeys } from "../model/raffleQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function invalidateFeaturedRaffles(queryClient) {
  await queryClient.invalidateQueries({
    queryKey: [...raffleQueryKeys.all, "featured"],
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function invalidateMyRaffle(queryClient) {
  await queryClient.invalidateQueries({ queryKey: raffleQueryKeys.my() });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function invalidateStaffRafflesQueue(queryClient) {
  await queryClient.invalidateQueries({ queryKey: raffleQueryKeys.staffQueue() });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function invalidateAllRaffleQueries(queryClient) {
  await queryClient.invalidateQueries({ queryKey: raffleQueryKeys.all });
}
