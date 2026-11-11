import { useMutation, useQueryClient } from "@tanstack/react-query";

import { putMyFortuneWheelConfig } from "../api/fortuneWheelApi.js";
import { fortuneWheelQueryKeys } from "./fortuneWheelQueryKeys.js";

export function usePutMyFortuneWheelConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: putMyFortuneWheelConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fortuneWheelQueryKeys.myConfig() });
    },
  });
}
