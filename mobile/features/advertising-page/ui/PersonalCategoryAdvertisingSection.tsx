import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { DEFAULT_VIEWER_REGION_CODE, isRuRegionCode } from "@molha/api-contract";

import { RuRegionSelect } from "@/entities/region/ui/RuRegionSelect";
import { useMySellerPersonalCategoryCampaignQuery } from "@/entities/seller-personal-category/model/useMySellerPersonalCategoryCampaignQuery";
import { useSellerPersonalCategoryMutations } from "@/entities/seller-personal-category/model/useSellerPersonalCategoryMutations";
import { resolvePersonalCategoryStatusPanelStyle } from "@/features/advertising-page/lib/resolveAdvertisingStatusPanelStyle";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { SELLER_PERSONAL_CATEGORY_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAdvertisingCardStyles } from "@/shared/theme/advertisingPageStyles";

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
  const [regionCode, setRegionCode] = useState(DEFAULT_VIEWER_REGION_CODE);
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
  const showTariffQuote = !hasOpenCampaign || showForm;

  const handleSubmit = async () => {
    if (!isRuRegionCode(regionCode)) {
      setActionError(SELLER_PERSONAL_CATEGORY_PAGE_UI.ERROR_REGION_REQUIRED);
      return;
    }
    try {
      setActionError("");
      setFeedback("");
      await submitMutation.mutateAsync({
        labelRu: labelRu.trim(),
        imageUrl: imageUrl.trim(),
        tariffCode,
        regionCode,
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
      <View style={[styles.card, styles.cardCategory]}>
        <Text style={styles.cardTitle}>{SELLER_PERSONAL_CATEGORY_PAGE_UI.SECTION_TITLE}</Text>
        <Text style={styles.state}>{SELLER_PERSONAL_CATEGORY_PAGE_UI.LOADING}</Text>
      </View>
    );
  }

  if (campaignQuery.isError) {
    return (
      <View style={[styles.card, styles.cardCategory]}>
        <Text style={styles.cardTitle}>{SELLER_PERSONAL_CATEGORY_PAGE_UI.SECTION_TITLE}</Text>
        <Text style={styles.error} accessibilityRole="alert">
          {formatApiErrorMessage(
            campaignQuery.error,
            SELLER_PERSONAL_CATEGORY_PAGE_UI.FETCH_FALLBACK,
          )}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.cardCategory]}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>{SELLER_PERSONAL_CATEGORY_PAGE_UI.SECTION_TITLE}</Text>
        {selectedDuration ? (
          <Text style={styles.cardBadge}>{selectedDuration.title}</Text>
        ) : null}
      </View>

      <Text style={styles.lead}>{SELLER_PERSONAL_CATEGORY_PAGE_UI.SECTION_LEAD}</Text>

      {showTariffQuote && selectedDuration ? (
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Стоимость</Text>
            <Text style={styles.metaValue}>{pricePoints} баллов</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Срок</Text>
            <Text style={styles.metaValue}>{selectedDuration.title}</Text>
          </View>
        </View>
      ) : null}

      {campaign ? (
        <View style={resolvePersonalCategoryStatusPanelStyle(styles, campaign.status)}>
          <Text style={[styles.statusText, isActiveCampaign && styles.statusTextActive]}>
            {resolveStatusLabel(campaign.status)}
          </Text>
          {isActiveCampaign && campaign.activeUntil ? (
            <Text style={[styles.statusText, isActiveCampaign && styles.statusTextActive]}>
              {SELLER_PERSONAL_CATEGORY_PAGE_UI.STATUS_ACTIVE_UNTIL(campaign.activeUntil)}
            </Text>
          ) : null}
          {canCancel ? (
            <Pressable
              style={[styles.cancelButton, isSubmitting && styles.cancelButtonDisabled]}
              onPress={() => {
                void handleCancel();
              }}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>
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
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Заявка на личную категорию</Text>
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{SELLER_PERSONAL_CATEGORY_PAGE_UI.LABEL_NAME}</Text>
              <TextInput
                style={styles.input}
                value={labelRu}
                maxLength={80}
                onChangeText={setLabelRu}
              />
            </View>
            <ImageUrlUploadField
              label={SELLER_PERSONAL_CATEGORY_PAGE_UI.LABEL_IMAGE}
              value={imageUrl}
              onChange={setImageUrl}
              disabled={isSubmitting}
            />
            <RuRegionSelect
              value={regionCode}
              disabled={isSubmitting}
              required
              label={SELLER_PERSONAL_CATEGORY_PAGE_UI.LABEL_REGION}
              onChange={setRegionCode}
            />
            <Text style={styles.timingHint}>{SELLER_PERSONAL_CATEGORY_PAGE_UI.HINT_REGION}</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                {SELLER_PERSONAL_CATEGORY_PAGE_UI.LABEL_DURATION}
              </Text>
              <View style={styles.tariffs}>
                {durations.map((item) => {
                  const isSelected = tariffCode === item.code;
                  return (
                    <Pressable
                      key={item.code}
                      style={[styles.tariff, isSelected && styles.tariffSelected]}
                      onPress={() => setTariffCode(item.code)}
                    >
                      <Text style={styles.tariffTitle}>{item.title}</Text>
                      <Text style={styles.tariffPrice}>{item.pricePoints} баллов</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {actionError ? (
              <Text style={styles.error} accessibilityRole="alert">
                {actionError}
              </Text>
            ) : null}

            <View style={styles.actions}>
              <Pressable
                style={[styles.cancelButton, isSubmitting && styles.cancelButtonDisabled]}
                onPress={() => setShowForm(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.primaryButton,
                  (isSubmitting || loyaltyBalance < pricePoints) && styles.primaryButtonDisabled,
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
        </View>
      ) : null}

      {feedback ? (
        <Text style={styles.feedback} accessibilityRole="text">
          {feedback}
        </Text>
      ) : null}
    </View>
  );
};
