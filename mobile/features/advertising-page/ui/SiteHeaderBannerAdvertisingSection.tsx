import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import {
  buildSubmitSiteHeaderBannerCampaignBody,
  createSiteHeaderBannerCampaignFormState,
  validateSiteHeaderBannerCampaignForm,
} from "@/entities/site-header-banner-campaign/lib/siteHeaderBannerCampaignForm";
import { useMySiteHeaderBannerCampaignQuery } from "@/entities/site-header-banner-campaign/model/useMySiteHeaderBannerCampaignQuery";
import { useSiteHeaderBannerCampaignMutations } from "@/entities/site-header-banner-campaign/model/useSiteHeaderBannerCampaignMutations";
import { resolvePreviewSiteHeaderBannerSlidesFromForm } from "@/entities/site-header-banner/lib/resolvePreviewSiteHeaderBannerSlidesFromForm";
import { SiteHeaderBannerCarousel } from "@/entities/site-header-banner/ui/SiteHeaderBannerCarousel";
import { resolveSiteHeaderBannerStatusPanelStyle } from "@/features/advertising-page/lib/resolveAdvertisingStatusPanelStyle";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAdvertisingCardStyles } from "@/shared/theme/advertisingPageStyles";

const DURATION_BADGE = "7 дней";

type SiteHeaderBannerAdvertisingSectionProps = {
  loyaltyBalance: number;
};

const resolveStatusLabel = (status?: string | null) => {
  if (status === "pending") return SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.STATUS_PENDING;
  if (status === "active") return SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.STATUS_ACTIVE;
  return "";
};

export const SiteHeaderBannerAdvertisingSection = ({
  loyaltyBalance,
}: SiteHeaderBannerAdvertisingSectionProps) => {
  const theme = useAppTheme();
  const styles = useAdvertisingCardStyles();
  const campaignQuery = useMySiteHeaderBannerCampaignQuery(true);
  const { submitMutation, cancelMutation } = useSiteHeaderBannerCampaignMutations();
  const [form, setForm] = useState(createSiteHeaderBannerCampaignFormState);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");

  const campaign = campaignQuery.data?.campaign ?? null;
  const pricePoints = campaignQuery.data?.pricePoints ?? 7_000;
  const durationDays = campaignQuery.data?.durationDays ?? 7;
  const paidSlotLimit = campaignQuery.data?.paidSlotLimit ?? 3;
  const activePaidSlots = campaignQuery.data?.activePaidSlots ?? 0;
  const canCancel = campaign?.status === "pending";
  const hasOpenCampaign = Boolean(campaign);
  const isSubmitting = submitMutation.isPending || cancelMutation.isPending;
  const isStatusActive = campaign?.status === "active";

  const previewSlides = useMemo(
    () =>
      resolvePreviewSiteHeaderBannerSlidesFromForm({
        enabled: true,
        items: [
          {
            id: "preview",
            enabled: true,
            imageUrl: form.imageUrl,
            imageAlt: form.imageAlt,
            linkPath: form.linkPath,
            backgroundColor: form.backgroundColor,
          },
        ],
      }),
    [form],
  );

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setActionError("");
    setFeedback("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const validationError = validateSiteHeaderBannerCampaignForm(form);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    try {
      setActionError("");
      setFeedback("");
      await submitMutation.mutateAsync(buildSubmitSiteHeaderBannerCampaignBody(form));
      setShowForm(false);
      setShowPreview(false);
      setFeedback(SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.SUBMIT_SUCCESS);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.SUBMIT_FALLBACK,
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
      setFeedback(SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CANCEL_SUCCESS);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CANCEL_FALLBACK,
      );
    }
  };

  if (campaignQuery.isPending) {
    return (
      <View style={[styles.card, styles.cardBanner]}>
        <Text style={styles.cardTitle}>{SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CARD_TITLE}</Text>
        <Text style={styles.state}>{SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.LOADING}</Text>
      </View>
    );
  }

  if (campaignQuery.isError) {
    return (
      <View style={[styles.card, styles.cardBanner]}>
        <Text style={styles.cardTitle}>{SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CARD_TITLE}</Text>
        <Text style={styles.error} accessibilityRole="alert">
          {formatApiErrorMessage(
            campaignQuery.error,
            SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.FETCH_FALLBACK,
          )}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.cardBanner]}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>{SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CARD_TITLE}</Text>
        <Text style={styles.cardBadge}>{DURATION_BADGE}</Text>
      </View>

      <Text style={styles.lead}>{SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.DESCRIPTION}</Text>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Стоимость</Text>
          <Text style={styles.metaValue}>{pricePoints} баллов</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Срок</Text>
          <Text style={styles.metaValue}>{durationDays} дней</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Слоты</Text>
          <Text style={styles.metaValue}>
            {activePaidSlots}/{paidSlotLimit}
          </Text>
        </View>
      </View>

      {campaign ? (
        <View style={resolveSiteHeaderBannerStatusPanelStyle(styles, campaign.status)}>
          <Text style={[styles.statusText, isStatusActive && styles.statusTextActive]}>
            {resolveStatusLabel(campaign.status)}
          </Text>
          {canCancel ? (
            <Pressable
              style={[styles.cancelButton, isSubmitting && styles.cancelButtonDisabled]}
              onPress={() => {
                void handleCancel();
              }}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>
                {SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CANCEL}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {!hasOpenCampaign && !showForm ? (
        <Pressable style={styles.primaryButton} onPress={() => setShowForm(true)}>
          <Text style={styles.primaryButtonText}>
            {SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.OPEN_FORM}
          </Text>
        </Pressable>
      ) : null}

      {!hasOpenCampaign && showForm ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Заявка на баннер в шапке</Text>
          <ImageUrlUploadField
            label="Изображение"
            value={form.imageUrl}
            onChange={(value) => updateField("imageUrl", value)}
          />
          <Text style={styles.fieldLabel}>Alt-текст</Text>
          <TextInput
            style={styles.input}
            value={form.imageAlt}
            onChangeText={(value) => updateField("imageAlt", value)}
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.fieldLabel}>Ссылка (необязательно)</Text>
          <TextInput
            style={styles.input}
            value={form.linkPath}
            onChangeText={(value) => updateField("linkPath", value)}
            placeholder="/catalog или https://…"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
          />
          <Text style={styles.fieldLabel}>Цвет фона (необязательно)</Text>
          <TextInput
            style={styles.input}
            value={form.backgroundColor}
            onChangeText={(value) => updateField("backgroundColor", value)}
            placeholder="#RRGGBB"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
          />
          {showPreview && previewSlides.length > 0 ? (
            <SiteHeaderBannerCarousel slides={previewSlides} />
          ) : null}
          {actionError ? (
            <Text style={styles.error} accessibilityRole="alert">
              {actionError}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              style={[styles.secondaryButton, isSubmitting && styles.secondaryButtonDisabled]}
              onPress={() => {
                const validationError = validateSiteHeaderBannerCampaignForm(form);
                if (validationError) {
                  setActionError(validationError);
                  return;
                }
                setShowPreview(true);
              }}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>
                {SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.PREVIEW}
              </Text>
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
                  {SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.SUBMIT}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : null}

      {feedback ? (
        <Text style={styles.feedback} role="status">
          {feedback}
        </Text>
      ) : null}
    </View>
  );
};
