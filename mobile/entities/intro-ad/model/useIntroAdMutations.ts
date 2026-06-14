import { useMutation, useQueryClient } from "@tanstack/react-query";

import { introAdQueryKeys, loyaltyPointsQueryKeys } from "@/shared/api";

import { cancelIntroAdCampaign, submitIntroAdCampaign } from "../api/introAdMutationsApi";

export const useIntroAdMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: introAdQueryKeys.myCampaign() });
    void queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
  };

  const submitMutation = useMutation({
    mutationFn: submitIntroAdCampaign,
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelIntroAdCampaign,
    onSuccess: invalidate,
  });

  return { submitMutation, cancelMutation };
};
