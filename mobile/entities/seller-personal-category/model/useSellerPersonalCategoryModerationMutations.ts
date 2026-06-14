import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveSellerPersonalCategoryCampaign,
  fetchPendingSellerPersonalCategoryCampaigns,
  rejectSellerPersonalCategoryCampaign,
} from "@/entities/seller-personal-category/api/sellerPersonalCategoryModerationApi";
import { sellerPersonalCategoryQueryKeys } from "@/shared/api";

const QUEUE_LIMIT = 50;

export const usePendingSellerPersonalCategoryCampaignsQuery = (enabled = true) =>
  useQuery({
    queryKey: sellerPersonalCategoryQueryKeys.moderationPending(QUEUE_LIMIT),
    queryFn: () => fetchPendingSellerPersonalCategoryCampaigns(QUEUE_LIMIT),
    enabled,
  });

export const useSellerPersonalCategoryModerationMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: sellerPersonalCategoryQueryKeys.all });
  };

  const approveMutation = useMutation({
    mutationFn: (campaignId: string) => approveSellerPersonalCategoryCampaign(campaignId),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ campaignId, reason }: { campaignId: string; reason?: string }) =>
      rejectSellerPersonalCategoryCampaign(campaignId, reason ?? ""),
    onSuccess: invalidate,
  });

  return { approveMutation, rejectMutation };
};
