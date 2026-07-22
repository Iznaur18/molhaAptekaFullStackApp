import { Image, Pressable, Text, TextInput, View } from "react-native";

import {
  formatSellerPersonalCategoryCampaignSummary,
  resolveSellerPersonalCategorySellerName,
} from "@/entities/seller-personal-category/lib/resolveSellerPersonalCategorySellerName";
import { ModerationCampaignCollapsibleFrame } from "@/features/intro-ad-moderation-page/ui/ModerationCampaignCollapsibleFrame";
import { resolveModerationCampaignCollapsedPreview } from "@/features/intro-ad-moderation-page/lib/resolveModerationCampaignCollapsedPreview";
import { campaignModerationNeedsAttention } from "@/shared/lib/campaignModerationAttention";
import { SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI } from "@/shared/config";
import { formatIsoDateTime } from "@/shared/lib";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useSellerPersonalCategoryModerationCampaignCardStyles } from "@/shared/theme/sellerPersonalCategoryModerationCampaignCardStyles";

export type SellerPersonalCategoryModerationCampaign = {
  _id: string;
  sellerId?: string | null;
  seller?: Record<string, unknown> | null;
  labelRu?: string | null;
  imageUrl?: string | null;
  amountPoints?: number | null;
  tariffCode?: string | null;
  activeUntil?: string | Date | null;
  createdAt?: string | Date | null;
};

type SellerPersonalCategoryModerationCampaignCardProps = {
  campaign: SellerPersonalCategoryModerationCampaign;
  mode: "pending" | "managed";
  isPending: boolean;
  rejectReason?: string;
  onRejectReasonChange?: (value: string) => void;
  onApprove?: () => void;
  onReject?: () => void;
  onStaffUnpublish?: () => void;
  onStaffDelete?: () => void;
  errorMessage?: string;
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: () => void;
};

export const SellerPersonalCategoryModerationCampaignCard = ({
  campaign,
  mode,
  isPending,
  rejectReason = "",
  onRejectReasonChange,
  onApprove,
  onReject,
  onStaffUnpublish,
  onStaffDelete,
  errorMessage = "",
  collapsible = false,
  expanded = true,
  onExpandedChange,
}: SellerPersonalCategoryModerationCampaignCardProps) => {
  const styles = useSellerPersonalCategoryModerationCampaignCardStyles();
  const sellerName = resolveSellerPersonalCategorySellerName(campaign);
  const title = sellerName || String(campaign.sellerId ?? "—");
  const imageSrc = campaign.imageUrl ? resolveUploadedMediaUrl(campaign.imageUrl) : "";
  const needsAttention = mode === "pending" && campaignModerationNeedsAttention(campaign);
  const collapsedPreview = resolveModerationCampaignCollapsedPreview(campaign);
  const createdLabel = campaign.createdAt ? formatIsoDateTime(campaign.createdAt) : null;

  const cardBody = (
    <View style={styles.card}>
      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}

      <Text style={styles.meta}>
        {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.SELLER_LABEL}:{" "}
        {sellerName || campaign.sellerId || "—"}
      </Text>

      <Text style={styles.meta}>{formatSellerPersonalCategoryCampaignSummary(campaign)}</Text>

      {mode === "managed" && campaign.activeUntil ? (
        <Text style={styles.meta}>
          {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STATUS_ACTIVE} · до{" "}
          {formatIsoDateTime(campaign.activeUntil)}
        </Text>
      ) : null}

      {imageSrc ? (
        <Image
          source={{ uri: imageSrc }}
          style={styles.preview}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      ) : null}

      {mode === "pending" && onRejectReasonChange ? (
        <TextInput
          style={styles.rejectInput}
          value={rejectReason}
          multiline
          numberOfLines={3}
          editable={!isPending}
          placeholder={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT_REASON_PLACEHOLDER}
          onChangeText={onRejectReasonChange}
        />
      ) : null}

      <View style={styles.actions}>
        {mode === "pending" && onApprove ? (
          <Pressable
            style={[styles.primaryButton, isPending && styles.buttonDisabled]}
            onPress={onApprove}
            disabled={isPending}
          >
            <Text style={styles.primaryButtonText}>
              {isPending
                ? SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.ACTION_PENDING
                : SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.APPROVE}
            </Text>
          </Pressable>
        ) : null}
        {mode === "pending" && onReject ? (
          <Pressable
            style={[styles.secondaryButton, isPending && styles.buttonDisabled]}
            onPress={onReject}
            disabled={isPending}
          >
            <Text style={styles.secondaryButtonText}>
              {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT}
            </Text>
          </Pressable>
        ) : null}
        {mode === "pending" && onStaffDelete ? (
          <Pressable
            style={[styles.dangerButton, isPending && styles.buttonDisabled]}
            onPress={onStaffDelete}
            disabled={isPending}
          >
            <Text style={styles.dangerButtonText}>
              {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_DELETE}
            </Text>
          </Pressable>
        ) : null}
        {mode === "managed" && onStaffUnpublish ? (
          <Pressable
            style={[styles.secondaryButton, isPending && styles.buttonDisabled]}
            onPress={onStaffUnpublish}
            disabled={isPending}
          >
            <Text style={styles.secondaryButtonText}>
              {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_UNPUBLISH}
            </Text>
          </Pressable>
        ) : null}
        {mode === "managed" && onStaffDelete ? (
          <Pressable
            style={[styles.dangerButton, isPending && styles.buttonDisabled]}
            onPress={onStaffDelete}
            disabled={isPending}
          >
            <Text style={styles.dangerButtonText}>
              {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_DELETE}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  if (!collapsible) {
    return cardBody;
  }

  return (
    <ModerationCampaignCollapsibleFrame
      title={title}
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
