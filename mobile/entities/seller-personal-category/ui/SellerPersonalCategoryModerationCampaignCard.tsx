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
  createdAt?: string | Date | null;
};

type SellerPersonalCategoryModerationCampaignCardProps = {
  campaign: SellerPersonalCategoryModerationCampaign;
  isPending: boolean;
  rejectReason: string;
  onRejectReasonChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  errorMessage?: string;
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: () => void;
};

export const SellerPersonalCategoryModerationCampaignCard = ({
  campaign,
  isPending,
  rejectReason,
  onRejectReasonChange,
  onApprove,
  onReject,
  errorMessage = "",
  collapsible = false,
  expanded = true,
  onExpandedChange,
}: SellerPersonalCategoryModerationCampaignCardProps) => {
  const styles = useSellerPersonalCategoryModerationCampaignCardStyles();
  const sellerName = resolveSellerPersonalCategorySellerName(campaign);
  const title = sellerName || String(campaign.sellerId ?? "—");
  const imageSrc = campaign.imageUrl ? resolveUploadedMediaUrl(campaign.imageUrl) : "";
  const needsAttention = campaignModerationNeedsAttention(campaign);
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

      {imageSrc ? (
        <Image
          source={{ uri: imageSrc }}
          style={styles.preview}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      ) : null}

      <TextInput
        style={styles.rejectInput}
        value={rejectReason}
        multiline
        numberOfLines={3}
        editable={!isPending}
        placeholder={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT_REASON_PLACEHOLDER}
        onChangeText={onRejectReasonChange}
      />

      <View style={styles.actions}>
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
        <Pressable
          style={[styles.secondaryButton, isPending && styles.buttonDisabled]}
          onPress={onReject}
          disabled={isPending}
        >
          <Text style={styles.secondaryButtonText}>
            {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT}
          </Text>
        </Pressable>
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
