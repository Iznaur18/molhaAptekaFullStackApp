import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { campaignToSiteHeaderBannerPreviewSlides } from "@/entities/site-header-banner-campaign/lib/campaignToSiteHeaderBannerPreviewSlides";
import { resolveIntroAdAdvertiserName } from "@/entities/intro-ad/lib/resolveIntroAdAdvertiserName";
import { SiteHeaderBannerCarousel } from "@/entities/site-header-banner/ui/SiteHeaderBannerCarousel";
import { ModerationCampaignCollapsibleFrame } from "@/features/intro-ad-moderation-page/ui/ModerationCampaignCollapsibleFrame";
import {
  resolveModerationCampaignCollapsedPreview,
  resolveModerationCampaignTitle,
} from "@/features/intro-ad-moderation-page/lib/resolveModerationCampaignCollapsedPreview";
import { campaignModerationNeedsAttention } from "@/shared/lib/campaignModerationAttention";
import { SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI } from "@/shared/config";
import { formatIsoDateTime } from "@/shared/lib";
import { useIntroAdModerationCampaignCardStyles } from "@/shared/theme/introAdModerationCampaignCardStyles";

export type SiteHeaderBannerCampaignModerationCampaign = {
  _id: string;
  advertiserId?: string | null;
  advertiser?: Record<string, unknown> | null;
  status?: string | null;
  createdAt?: string | Date | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  linkPath?: string | null;
  backgroundColor?: string | null;
};

type SiteHeaderBannerCampaignModerationCardProps = {
  campaign: SiteHeaderBannerCampaignModerationCampaign;
  isPending: boolean;
  mode: "pending" | "managed";
  onApprove?: () => void;
  onReject?: () => void;
  onStaffCancel?: () => void;
  rejectReason?: string;
  onRejectReasonChange?: (value: string) => void;
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: () => void;
};

export const SiteHeaderBannerCampaignModerationCard = ({
  campaign,
  isPending,
  mode,
  onApprove,
  onReject,
  onStaffCancel,
  rejectReason = "",
  onRejectReasonChange,
  collapsible = false,
  expanded = true,
  onExpandedChange,
}: SiteHeaderBannerCampaignModerationCardProps) => {
  const styles = useIntroAdModerationCampaignCardStyles();
  const [showPreview, setShowPreview] = useState(false);
  const advertiserName = resolveIntroAdAdvertiserName(campaign);
  const needsAttention = mode === "pending" && campaignModerationNeedsAttention(campaign);
  const collapsedPreview = resolveModerationCampaignCollapsedPreview(campaign);
  const createdLabel =
    mode === "pending" && campaign.createdAt ? formatIsoDateTime(campaign.createdAt) : null;
  const previewSlides = useMemo(
    () => campaignToSiteHeaderBannerPreviewSlides(campaign),
    [campaign],
  );
  const canPreview = previewSlides.length > 0;

  const cardBody = (
    <View style={styles.card}>
      <Text style={styles.meta}>
        {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.ADVERTISER_LABEL}: {advertiserName}
      </Text>

      {mode === "managed" ? (
        <Text style={styles.meta}>
          {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.STATUS_LABEL}:{" "}
          {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.STATUS_ACTIVE}
        </Text>
      ) : (
        <Text style={styles.meta}>
          {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.SUBMITTED_LABEL}:{" "}
          {campaign.createdAt ? formatIsoDateTime(campaign.createdAt) : "—"}
        </Text>
      )}

      {showPreview && canPreview ? (
        <View style={styles.bannerCarouselPreview}>
          <SiteHeaderBannerCarousel slides={previewSlides} />
        </View>
      ) : null}

      <View style={styles.actions}>
        {canPreview ? (
          <Pressable
            style={[styles.secondaryButton, isPending && styles.buttonDisabled]}
            onPress={() => setShowPreview((prev) => !prev)}
            disabled={isPending}
          >
            <Text style={styles.secondaryButtonText}>
              {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.PREVIEW}
            </Text>
          </Pressable>
        ) : null}

        {mode === "pending" && onApprove ? (
          <Pressable
            style={[styles.primaryButton, isPending && styles.buttonDisabled]}
            onPress={onApprove}
            disabled={isPending}
          >
            <Text style={styles.primaryButtonText}>
              {isPending
                ? SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.ACTION_PENDING
                : SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.APPROVE}
            </Text>
          </Pressable>
        ) : null}

        {mode === "managed" && onStaffCancel ? (
          <Pressable
            style={[styles.cancelButton, isPending && styles.buttonDisabled]}
            onPress={onStaffCancel}
            disabled={isPending}
          >
            <Text style={styles.cancelButtonText}>
              {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.STAFF_CANCEL}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {mode === "pending" && onReject && onRejectReasonChange ? (
        <>
          <Text style={styles.rejectLabel}>
            {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.REJECT_REASON_LABEL}
          </Text>
          <TextInput
            style={styles.rejectInput}
            value={rejectReason}
            onChangeText={onRejectReasonChange}
            placeholder={SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.REJECT_REASON_PLACEHOLDER}
            multiline
          />
          <Pressable
            style={[styles.dangerButton, isPending && styles.buttonDisabled]}
            onPress={onReject}
            disabled={isPending}
          >
            <Text style={styles.dangerButtonText}>
              {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.REJECT}
            </Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );

  if (!collapsible) {
    return cardBody;
  }

  return (
    <ModerationCampaignCollapsibleFrame
      title={resolveModerationCampaignTitle(campaign)}
      collapsedPreview={collapsedPreview}
      createdLabel={createdLabel}
      needsAttention={needsAttention}
      collapsible
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      {cardBody}
    </ModerationCampaignCollapsibleFrame>
  );
};
