import { useMutation, useQueryClient } from "@tanstack/react-query";

import { putMyLuckyBoxConfig } from "../api/luckyBoxApi";
import { luckyBoxQueryKeys } from "./luckyBoxQueryKeys";

/** Паритет web `usePutMyLuckyBoxConfigMutation`. */
export function usePutMyLuckyBoxConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: putMyLuckyBoxConfig,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: luckyBoxQueryKeys.myConfig() });
    },
  });
}