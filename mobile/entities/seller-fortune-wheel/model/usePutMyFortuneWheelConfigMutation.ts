import { useMutation, useQueryClient } from "@tanstack/react-query";

import { putMyFortuneWheelConfig } from "../api/fortuneWheelApi";
import { fortuneWheelQueryKeys } from "./fortuneWheelQueryKeys";

/** Паритет web `usePutMyFortuneWheelConfigMutation`. */
export function usePutMyFortuneWheelConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: putMyFortuneWheelConfig,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: fortuneWheelQueryKeys.myConfig(),
      });
    },
  });
}