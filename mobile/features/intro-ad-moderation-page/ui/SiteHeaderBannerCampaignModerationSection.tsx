import { useCallback, useState } from "react";
import { View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import {
  SITE_HEADER_BANNER_CAMPAIGN_MODERATION_QUEUE_LIMIT,
  useManagedSiteHeaderBannerCampaignsQuery,
  usePendingSiteHeaderBannerCampaignsQuery,
  useSiteHeaderBannerCampaignModerationMutations,
} from "@/entities/site-header-banner-campaign/model/useSiteHeaderBannerCampaignModerationMutations";
import { SiteHeaderBannerCampaignModerationCard } from "@/entities/site-header-banner-campaign/ui/SiteHeaderBannerCampaignModerationCard";
import { ModerationSectionTitle } from "@/features/intro-ad-moderation-page/ui/ModerationSectionTitle";
import { SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useIntroAdModerationPageStyles } from "@/shared/theme/introAdModerationPageStyles";
import { staffBadgeQueryKeys } from "@/shared/api";

type SiteHeaderBannerCampaignModerationSectionProps = {
  onActionError?: (message: string) => void;
};

export const SiteHeaderBannerCampaignModerationSection = ({
  onActionError,
}: SiteHeaderBannerCampaignModerationSectionProps) => {
  const styles = useIntroAdModerationPageStyles();
  const queryClient = useQueryClient();
  const queueQuery = usePendingSiteHeaderBannerCampaignsQuery();
  const managedQuery = useManagedSiteHeaderBannerCampaignsQuery();
  const { approveMutation, rejectMutation, staffCancelMutation } =
    useSiteHeaderBannerCampaignModerationMutations();
  const [pendingCampaignId, setPendingCampaignId] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  const pendingCampaigns = queueQuery.data ?? [];
  const managedCampaigns = managedQuery.data ?? [];

  const handleApprove = useCallback(
    async (campaignId: string) => {
      try {
        setPendingCampaignId(campaignId);
        onActionError?.("");
        await approveMutation.mutateAsync(campaignId);
        await queryClient.invalidateQueries({
          queryKey: [...staffBadgeQueryKeys.all, "intro-ad"],
        });
      } catch (error) {
        onActionError?.(
          formatApiErrorMessage(error, SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.APPROVE_FALLBACK),
        );
      } finally {
        setPendingCampaignId(null);
      }
    },
    [approveMutation, onActionError],
  );

  const handleReject = useCallback(
    async (campaignId: string) => {
      try {
        setPendingCampaignId(campaignId);
        onActionError?.("");
        await rejectMutation.mutateAsync({
          campaignId,
          reason: rejectReasons[campaignId] ?? "",
        });
        await queryClient.invalidateQueries({
          queryKey: [...staffBadgeQueryKeys.all, "intro-ad"],
        });
      } catch (error) {
        onActionError?.(
          formatApiErrorMessage(error, SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.REJECT_FALLBACK),
        );
      } finally {
        setPendingCampaignId(null);
      }
    },
    [onActionError, rejectMutation, rejectReasons],
  );

  const handleStaffCancel = useCallback(
    async (campaignId: string) => {
      try {
        setPendingCampaignId(campaignId);
        onActionError?.("");
        await staffCancelMutation.mutateAsync(campaignId);
        await queryClient.invalidateQueries({
          queryKey: [...staffBadgeQueryKeys.all, "intro-ad"],
        });
      } catch (error) {
        onActionError?.(
          formatApiErrorMessage(
            error,
            SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.STAFF_CANCEL_FALLBACK,
          ),
        );
      } finally {
        setPendingCampaignId(null);
      }
    },
    [onActionError, staffCancelMutation],
  );

  if (pendingCampaigns.length === 0 && managedCampaigns.length === 0) {
    return null;
  }

  return (
    <>
      {managedCampaigns.length > 0 ? (
        <View style={styles.section}>
          <ModerationSectionTitle
            title={SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.MANAGED_TITLE}
          />
          <View style={styles.list}>
            {managedCampaigns.map((campaign) => {
              const campaignId = String(campaign._id);
              return (
                <SiteHeaderBannerCampaignModerationCard
                  key={campaignId}
                  campaign={campaign}
                  isPending={pendingCampaignId === campaignId}
                  mode="managed"
                  onStaffCancel={() => {
                    void handleStaffCancel(campaignId);
                  }}
                />
              );
            })}
          </View>
        </View>
      ) : null}

      {pendingCampaigns.length > 0 ? (
        <View style={styles.section}>
          <ModerationSectionTitle
            title={SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.PENDING_TITLE}
            pendingCount={pendingCampaigns.length}
          />
          <View style={styles.list}>
            {pendingCampaigns.map((campaign) => {
              const campaignId = String(campaign._id);
              return (
                <SiteHeaderBannerCampaignModerationCard
                  key={campaignId}
                  campaign={campaign}
                  isPending={pendingCampaignId === campaignId}
                  mode="pending"
                  onApprove={() => {
                    void handleApprove(campaignId);
                  }}
                  onReject={() => {
                    void handleReject(campaignId);
                  }}
                  rejectReason={rejectReasons[campaignId] ?? ""}
                  onRejectReasonChange={(value) =>
                    setRejectReasons((prev) => ({ ...prev, [campaignId]: value }))
                  }
                />
              );
            })}
          </View>
        </View>
      ) : null}
    </>
  );
};

export { SITE_HEADER_BANNER_CAMPAIGN_MODERATION_QUEUE_LIMIT };
