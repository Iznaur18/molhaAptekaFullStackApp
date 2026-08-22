import type { QueryClient } from "@tanstack/react-query";

import { curatedCategoryListQueryKeys } from "../model/curatedCategoryListQueryKeys";

export async function invalidateCuratedCategoryLists(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: curatedCategoryListQueryKeys.all });
}
