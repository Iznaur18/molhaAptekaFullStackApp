import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchProductBadgeExplain } from "../api/patchProductBadgeExplain.js";
import { productBadgeExplainQueryKeys } from "../lib/productBadgeExplainQueryKeys.js";

export function useProductBadgeExplainMutations() {
  const queryClient = useQueryClient();

  const patchBadgeMutation = useMutation({
    mutationFn: ({ badgeKey, body }) => patchProductBadgeExplain(badgeKey, body),
    onSuccess: (display) => {
      queryClient.setQueryData(productBadgeExplainQueryKeys.list(), (prev) => {
        const prevDisplays = Array.isArray(prev?.displays) ? prev.displays : [];
        const nextDisplays = prevDisplays.filter(
          (row) => row.badgeKey !== display.badgeKey,
        );
        nextDisplays.push(display);
        return { displays: nextDisplays };
      });
      void queryClient.invalidateQueries({
        queryKey: productBadgeExplainQueryKeys.all,
      });
    },
  });

  return { patchBadgeMutation };
}
