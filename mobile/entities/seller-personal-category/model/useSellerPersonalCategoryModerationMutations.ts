import { useMutation, useQuery } from "@tanstack/react-query";

import {
  approveSellerPersonalCategoryCampaign,
  cancelSellerPersonalCategoryCampaignByStaff,
  deleteSellerPersonalCategoryCampaignByStaff,
  fetchManagedSellerPersonalCategoryCampaigns,
  fetchPendingSellerPersonalCategoryCampaigns,
  rejectSellerPersonalCategoryCampaign,
} from "@/entities/seller-personal-category/api/sellerPersonalCategoryModerationApi";
import { sellerPersonalCategoryQueryKeys } from "@/shared/api";

export const SELLER_PERSONAL_CATEGORY_MODERATION_QUEUE_LIMIT = 50;

export const usePendingSellerPersonalCategoryCampaignsQuery = (enabled = true) =>
  useQuery({
    queryKey: sellerPersonalCategoryQueryKeys.moderationPending(
      SELLER_PERSONAL_CATEGORY_MODERATION_QUEUE_LIMIT,
    ),
    queryFn: () =>
      fetchPendingSellerPersonalCategoryCampaigns(
        SELLER_PERSONAL_CATEGORY_MODERATION_QUEUE_LIMIT,
      ),
    enabled,
  });

export const useManagedSellerPersonalCategoryCampaignsQuery = (enabled = true) =>
  useQuery({
    queryKey: sellerPersonalCategoryQueryKeys.moderationManaged(),
    queryFn: fetchManagedSellerPersonalCategoryCampaigns,
    enabled,
  });

export const useSellerPersonalCategoryModerationMutations = () => {
  const approveMutation = useMutation({
    mutationFn: (campaignId: string) => approveSellerPersonalCategoryCampaign(campaignId),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ campaignId, reason }: { campaignId: string; reason?: string }) =>
      rejectSellerPersonalCategoryCampaign(campaignId, reason ?? ""),
  });

  const staffUnpublishMutation = useMutation({
    mutationFn: (campaignId: string) => cancelSellerPersonalCategoryCampaignByStaff(campaignId),
  });

  const staffDeleteMutation = useMutation({
    mutationFn: (campaignId: string) => deleteSellerPersonalCategoryCampaignByStaff(campaignId),
  });

  return {
    approveMutation,
    rejectMutation,
    staffUnpublishMutation,
    staffDeleteMutation,
  };
};
