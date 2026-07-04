import { Pressable, Text, TextInput, View } from "react-native";

import { resolveIntroAdAdvertiserName } from "@/entities/intro-ad/lib/resolveIntroAdAdvertiserName";
import { resolveIntroAdManagedStatusLabel } from "@/entities/intro-ad/lib/resolveIntroAdManagedStatusLabel";
import { ModerationCampaignCollapsibleFrame } from "@/features/intro-ad-moderation-page/ui/ModerationCampaignCollapsibleFrame";
import {
  resolveModerationCampaignCollapsedPreview,
  resolveModerationCampaignTitle,
} from "@/features/intro-ad-moderation-page/lib/resolveModerationCampaignCollapsedPreview";
import { campaignModerationNeedsAttention } from "@/shared/lib/campaignModerationAttention";
import { INTRO_AD_MODERATION_PAGE_UI } from "@/shared/config";
import { formatIsoDateTime } from "@/shared/lib";
import { useIntroAdModerationCampaignCardStyles } from "@/shared/theme/introAdModerationCampaignCardStyles";

export type IntroAdModerationCampaign = {
  _id: string;
  advertiserId?: string | null;
  advertiser?: Record<string, unknown> | null;
  status?: string | null;
  createdAt?: string | Date | null;
};

type IntroAdModerationCampaignCardProps = {
  campaign: IntroAdModerationCampaign;
  isPending: boolean;
  mode: "pending" | "managed";
  onPreview: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onStaffCancel?: () => void;
  rejectReason?: string;
  onRejectReasonChange?: (value: string) => void;
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: () => void;
};

export const IntroAdModerationCampaignCard = ({
  campaign,
  isPending,
  mode,
  onPreview,
  onApprove,
  onReject,
  onStaffCancel,
  rejectReason = "",
  onRejectReasonChange,
  collapsible = false,
  expanded = true,
  onExpandedChange,
}: IntroAdModerationCampaignCardProps) => {
  const styles = useIntroAdModerationCampaignCardStyles();
  const advertiserName = resolveIntroAdAdvertiserName(campaign);
  const needsAttention = mode === "pending" && campaignModerationNeedsAttention(campaign);
  const collapsedPreview = resolveModerationCampaignCollapsedPreview(campaign);
  const createdLabel =
    mode === "pending" && campaign.createdAt ? formatIsoDateTime(campaign.createdAt) : null;

  const cardBody = (
    <View style={styles.card}>
      <Text style={styles.meta}>
        {INTRO_AD_MODERATION_PAGE_UI.ADVERTISER_LABEL}: {advertiserName}
      </Text>

      {mode === "managed" ? (
        <Text style={styles.meta}>
          {INTRO_AD_MODERATION_PAGE_UI.STATUS_LABEL}:{" "}
          {resolveIntroAdManagedStatusLabel(campaign.status)}
        </Text>
      ) : (
        <Text style={styles.meta}>
          {INTRO_AD_MODERATION_PAGE_UI.SUBMITTED_LABEL}:{" "}
          {campaign.createdAt ? formatIsoDateTime(campaign.createdAt) : "—"}
        </Text>
      )}

      <View style={styles.actions}>
        <Pressable
          style={[styles.secondaryButton, isPending && styles.buttonDisabled]}
          onPress={onPreview}
          disabled={isPending}
        >
          <Text style={styles.secondaryButtonText}>{INTRO_AD_MODERATION_PAGE_UI.PREVIEW}</Text>
        </Pressable>

        {mode === "pending" && onApprove ? (
          <Pressable
            style={[styles.primaryButton, isPending && styles.buttonDisabled]}
            onPress={onApprove}
            disabled={isPending}
          >
            <Text style={styles.primaryButtonText}>
              {isPending
                ? INTRO_AD_MODERATION_PAGE_UI.ACTION_PENDING
                : INTRO_AD_MODERATION_PAGE_UI.APPROVE}
            </Text>
          </Pressable>
        ) : null}

        {mode === "managed" && onStaffCancel ? (
          <Pressable
            style={[styles.cancelButton, isPending && styles.buttonDisabled]}
            onPress={onStaffCancel}
            disabled={isPending}
          >
            <Text style={styles.cancelButtonText}>{INTRO_AD_MODERATION_PAGE_UI.STAFF_CANCEL}</Text>
          </Pressable>
        ) : null}
      </View>

      {mode === "pending" && onReject && onRejectReasonChange ? (
        <>
          <View style={styles.rejectLabel}>
            <Text>{INTRO_AD_MODERATION_PAGE_UI.REJECT_REASON_LABEL}</Text>
            <TextInput
              style={styles.rejectInput}
              value={rejectReason}
              multiline
              numberOfLines={3}
              editable={!isPending}
              placeholder={INTRO_AD_MODERATION_PAGE_UI.REJECT_REASON_PLACEHOLDER}
              onChangeText={onRejectReasonChange}
            />
          </View>
          <Pressable
            style={[styles.dangerButton, isPending && styles.buttonDisabled]}
            onPress={onReject}
            disabled={isPending}
          >
            <Text style={styles.dangerButtonText}>{INTRO_AD_MODERATION_PAGE_UI.REJECT}</Text>
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
