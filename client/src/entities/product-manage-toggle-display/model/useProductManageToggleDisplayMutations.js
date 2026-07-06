import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchProductManageToggleDisplay } from "../api/patchProductManageToggleDisplay.js";
import { productManageToggleDisplayQueryKeys } from "../lib/productManageToggleDisplayQueryKeys.js";

export function useProductManageToggleDisplayMutations() {
  const queryClient = useQueryClient();

  const patchToggleMutation = useMutation({
    mutationFn: ({ toggleKey, body }) => patchProductManageToggleDisplay(toggleKey, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productManageToggleDisplayQueryKeys.all,
      });
    },
  });

  return { patchToggleMutation };
}
