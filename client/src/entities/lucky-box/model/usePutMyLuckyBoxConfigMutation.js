import { useMutation, useQueryClient } from "@tanstack/react-query";

import { putMyLuckyBoxConfig } from "../api/luckyBoxApi.js";
import { luckyBoxQueryKeys } from "./luckyBoxQueryKeys.js";

export function usePutMyLuckyBoxConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: putMyLuckyBoxConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: luckyBoxQueryKeys.myConfig() });
    },
  });
}
