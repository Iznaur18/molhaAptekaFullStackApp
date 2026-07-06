import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchProductManageToggleDisplay } from "../api/patchProductManageToggleDisplay";
import { productManageToggleDisplayQueryKeys } from "../lib/productManageToggleDisplayQueryKeys";

export const useProductManageToggleDisplayMutations = () => {
  const queryClient = useQueryClient();

  const patchToggleMutation = useMutation({
    mutationFn: ({
      toggleKey,
      body,
    }: {
      toggleKey: string;
      body: { imageUrl?: string | null; resetImageUrl?: boolean };
    }) => patchProductManageToggleDisplay(toggleKey, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productManageToggleDisplayQueryKeys.all,
      });
    },
  });

  return { patchToggleMutation };
};
