import type { QueryClient } from "@tanstack/react-query";

import { curatedProductListQueryKeys } from "@/shared/api";

export async function invalidateCuratedProductLists(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    queryKey: [...curatedProductListQueryKeys.all, "home"],
  });
}
