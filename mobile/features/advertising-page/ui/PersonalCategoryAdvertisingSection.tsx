import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useMySellerPersonalCategoryCampaignQuery } from "@/entities/seller-personal-category/model/useMySellerPersonalCategoryCampaignQuery";
import { useSellerPersonalCategoryMutations } from "@/entities/seller-personal-category/model/useSellerPersonalCategoryMutations";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { SELLER_PERSONAL_CATEGORY_PAGE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAdvertisingCardStyles } from "@/shared/theme/sellerFlowStyles";

type PersonalCategoryAdvertisingSectionProps = {
  loyaltyBalance: number;
};

const resolveStatusLabel = (status?: string | null) => {
  if (status === "pending") return SELLER_PERSONAL_CATEGORY_PAGE_UI.STATUS_PENDING;
  if (status === "active") return SELLER_PERSONAL_CATEGORY_PAGE_UI.STATUS_ACTIVE;
  return "";
};

export const PersonalCategoryAdvertisingSection = ({
  loyaltyBalance,
}: PersonalCategoryAdvertisingSectionProps) => {
  const theme = useAppTheme();
  const styles = useAdvertisingCardStyles();
  const campaignQuery = useMySellerPersonalCategoryCampaignQuery(true);
  const { submitMutation, cancelMutation } = useSellerPersonalCategoryMutations();
  const [labelRu, setLabelRu] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tariffCode, setTariffCode] = useState("7d");
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");

  const durations = campaignQuery.data?.durations ?? [];
  const selectedDuration = useMemo(
    () => durations.find((item) => item.code === tariffCode) ?? durations[0] ?? null,
    [durations, tariffCode],
  );
  const pricePoints = selectedDuration?.pricePoints ?? 0;

  const campaign = campaignQuery.data?.campaign ?? null;
  const canCancel = campaign?.status === "pending";
  const isActiveCampaign = campaign?.status === "active";
  const hasOpenCampaign = Boolean(campaign);
  const isSubmitting = submitMutation.isPending || cancelMutation.isPending;

  const handleSubmit = async () => {
    try {
      setActionError("");
      setFeedback("");
      await submitMutation.mutateAsync({
        labelRu: labelRu.trim(),
        imageUrl: imageUrl.trim(),
        tariffCode,
      });
      setShowForm(false);
      setFeedback(SELLER_PERSONAL_CATEGORY_PAGE_UI.SUBMIT_SUCCESS);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : SELLER_PERSONAL_CATEGORY_PAGE_UI.SUBMIT_FALLBACK,
      );
    }
  };

  const handleCancel = async () => {
    if (!campaign?._id) {
      return;
    }

    try {
      setActionError("");
      setFeedback("");
      await cancelMutation.mutateAsync(campaign._id);
      setFeedback(SELLER_PERSONAL_CATEGORY_PAGE_UI.CANCEL_SUCCESS);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : SELLER_PERSONAL_CATEGORY_PAGE_UI.CANCEL_FALLBACK,
      );
    }
  };

  if (campaignQuery.isPending) {
    return (
      <View style={styles.card}>
        <Text style={styles.loading}>{SELLER_PERSONAL_CATEGORY_PAGE_UI.LOADING}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {SELLER_PERSONAL_CATEGORY_PAGE_UI.SECTION_TITLE}
      </Text>
      <Text style={styles.lead}>
        {SELLER_PERSONAL_CATEGORY_PAGE_UI.SECTION_LEAD}
      </Text>

      {selectedDuration ? (
        <Text style={styles.meta}>
          {SELLER_PERSONAL_CATEGORY_PAGE_UI.PRICE(pricePoints)} · {selectedDuration.title}
        </Text>
      ) : null}
      <Text style={styles.meta}>
        {SELLER_PERSONAL_CATEGORY_PAGE_UI.BALANCE(loyaltyBalance)}
      </Text>

      {campaign ? (
        <View style={styles.statusPanel}>
          <Text style={styles.statusText}>{resolveStatusLabel(campaign.status)}</Text>
          {isActiveCampaign && campaign.activeUntil ? (
            <Text style={styles.statusText}>
              {SELLER_PERSONAL_CATEGORY_PAGE_UI.STATUS_ACTIVE_UNTIL(campaign.activeUntil)}
            </Text>
          ) : null}
          {campaign.labelRu ? <Text style={styles.statusText}>{campaign.labelRu}</Text> : null}
          {canCancel ? (
            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                void handleCancel();
              }}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>
                {SELLER_PERSONAL_CATEGORY_PAGE_UI.CANCEL}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {!hasOpenCampaign && !showForm ? (
        <Pressable style={styles.primaryButton} onPress={() => setShowForm(true)}>
          <Text style={styles.primaryButtonText}>
            {SELLER_PERSONAL_CATEGORY_PAGE_UI.OPEN_FORM}
          </Text>
        </Pressable>
      ) : null}

      {!hasOpenCampaign && showForm ? (
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>{SELLER_PERSONAL_CATEGORY_PAGE_UI.LABEL_NAME}</Text>
          <TextInput
            style={styles.input}
            value={labelRu}
            maxLength={80}
            onChangeText={setLabelRu}
          />
          <ImageUrlUploadField
            label={SELLER_PERSONAL_CATEGORY_PAGE_UI.LABEL_IMAGE}
            value={imageUrl}
            onChange={setImageUrl}
            disabled={isSubmitting}
          />
          <Text style={styles.fieldLabel}>{SELLER_PERSONAL_CATEGORY_PAGE_UI.LABEL_DURATION}</Text>
          {durations.map((item) => {
            const isActive = tariffCode === item.code;
            return (
              <Pressable
                key={item.code}
                style={[styles.tariffChip, isActive && styles.tariffChipActive]}
                onPress={() => setTariffCode(item.code)}
              >
                <Text style={[styles.tariffText, isActive && styles.tariffTextActive]}>
                  {item.title} · {item.pricePoints} баллов
                </Text>
              </Pressable>
            );
          })}

          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={() => setShowForm(false)}>
              <Text style={styles.secondaryButtonText}>Отмена</Text>
            </Pressable>
            <Pressable
              style={[
                styles.primaryButton,
                (isSubmitting || loyaltyBalance < pricePoints) && styles.disabled,
              ]}
              onPress={() => {
                void handleSubmit();
              }}
              disabled={isSubmitting || loyaltyBalance < pricePoints}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.onContrast} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {SELLER_PERSONAL_CATEGORY_PAGE_UI.SUBMIT}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : null}

      {feedback ? <Text style={styles.success}>{feedback}</Text> : null}
    </View>
  );
};
