import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useIntroAdMutations } from "@/entities/intro-ad/model/useIntroAdMutations";
import { useMyIntroAdCampaignQuery } from "@/entities/intro-ad/model/useMyIntroAdCampaignQuery";
import { useAppIntro } from "@/features/app-intro/model/AppIntroProvider";
import {
  buildSubmitIntroAdCampaignBody,
  introAdFormToPreviewSettings,
} from "@/features/advertising-page/lib/buildSubmitIntroAdCampaignBody";
import { resolveIntroAdStatusPanelStyle } from "@/features/advertising-page/lib/resolveAdvertisingStatusPanelStyle";
import {
  createIntroAdFormState,
  type IntroAdFormState,
} from "@/features/advertising-page/lib/mapIntroAdFormDefaults";
import { IS_INTRO_AD_ADVERTISING_ENABLED } from "@/features/advertising-page/model/isIntroAdAdvertisingEnabled";
import { validateIntroAdForm } from "@/features/advertising-page/lib/validateIntroAdForm";
import { IntroVideoUploadField } from "@/features/image-upload/ui/IntroVideoUploadField";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { INTRO_AD_PAGE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAdvertisingCardStyles } from "@/shared/theme/advertisingPageStyles";

const INTRO_DURATION_BADGE = "3 дня";

type IntroAdAdvertisingSectionProps = {
  loyaltyBalance: number;
};

const resolveStatusLabel = (status?: string | null) => {
  if (status === "pending") return INTRO_AD_PAGE_UI.STATUS_PENDING;
  if (status === "queued") return INTRO_AD_PAGE_UI.STATUS_QUEUED;
  if (status === "active") return INTRO_AD_PAGE_UI.STATUS_ACTIVE;
  return "";
};

export const IntroAdAdvertisingSection = ({ loyaltyBalance }: IntroAdAdvertisingSectionProps) => {
  const theme = useAppTheme();
  const styles = useAdvertisingCardStyles();
  const { previewIntro } = useAppIntro();
  const campaignQuery = useMyIntroAdCampaignQuery(true);
  const { submitMutation, cancelMutation } = useIntroAdMutations();
  const [form, setForm] = useState<IntroAdFormState>(() => createIntroAdFormState());
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");

  const campaign = campaignQuery.data?.campaign ?? null;
  const pricePoints = campaignQuery.data?.pricePoints ?? 6_000;
  const canCancel = campaign?.status === "pending" || campaign?.status === "queued";
  const hasOpenCampaign = Boolean(campaign);
  const isSubmitting = submitMutation.isPending || cancelMutation.isPending;
  const isStatusActive = campaign?.status === "active";

  const updateField = <K extends keyof IntroAdFormState>(key: K, value: IntroAdFormState[K]) => {
    setActionError("");
    setFeedback("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePreview = () => {
    const validationError = validateIntroAdForm(form);
    if (validationError) {
      setActionError(validationError);
      return;
    }
    previewIntro(introAdFormToPreviewSettings(buildSubmitIntroAdCampaignBody(form)));
  };

  const handleSubmit = async () => {
    const validationError = validateIntroAdForm(form);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    try {
      setActionError("");
      setFeedback("");
      await submitMutation.mutateAsync(buildSubmitIntroAdCampaignBody(form));
      setShowForm(false);
      setFeedback(INTRO_AD_PAGE_UI.SUBMIT_SUCCESS);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : INTRO_AD_PAGE_UI.SUBMIT_FALLBACK);
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
      setFeedback(INTRO_AD_PAGE_UI.CANCEL_SUCCESS);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : INTRO_AD_PAGE_UI.CANCEL_FALLBACK);
    }
  };

  if (!IS_INTRO_AD_ADVERTISING_ENABLED) {
    return (
      <View
        style={[styles.card, styles.cardIntro, styles.cardDisabled]}
        accessibilityState={{ disabled: true }}
      >
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>{INTRO_AD_PAGE_UI.CARD_TITLE}</Text>
          <Text style={[styles.cardBadge, styles.cardBadgeDisabled]}>
            {INTRO_AD_PAGE_UI.TEMPORARILY_UNAVAILABLE}
          </Text>
        </View>
        <Text style={styles.unavailableNotice}>{INTRO_AD_PAGE_UI.TEMPORARILY_UNAVAILABLE}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.cardIntro]}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>{INTRO_AD_PAGE_UI.CARD_TITLE}</Text>
        <Text style={styles.cardBadge}>{INTRO_DURATION_BADGE}</Text>
      </View>

      <Text style={styles.lead}>{INTRO_AD_PAGE_UI.DESCRIPTION}</Text>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Стоимость</Text>
          <Text style={styles.metaValue}>{pricePoints} баллов</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Срок</Text>
          <Text style={styles.metaValue}>{INTRO_DURATION_BADGE}</Text>
        </View>
      </View>

      {campaign ? (
        <View style={resolveIntroAdStatusPanelStyle(styles, campaign.status)}>
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
              <Text style={styles.cancelButtonText}>{INTRO_AD_PAGE_UI.CANCEL}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {!hasOpenCampaign && !showForm ? (
        <Pressable style={styles.primaryButton} onPress={() => setShowForm(true)}>
          <Text style={styles.primaryButtonText}>{INTRO_AD_PAGE_UI.OPEN_FORM}</Text>
        </Pressable>
      ) : null}

      {!hasOpenCampaign && showForm ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Заявка на intro</Text>
          <View style={styles.form}>
            <IntroVideoUploadField
              value={form.videoMp4Url}
              onChange={(value) => updateField("videoMp4Url", value)}
              disabled={isSubmitting}
            />
            <ImageUrlUploadField
              label="Poster"
              value={form.posterUrl}
              onChange={(value) => updateField("posterUrl", value)}
              disabled={isSubmitting}
            />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Заголовок заглушки</Text>
              <TextInput
                style={styles.input}
                value={form.fallbackTitle}
                onChangeText={(value) => updateField("fallbackTitle", value)}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Подсказка заглушки</Text>
              <TextInput
                style={styles.input}
                value={form.fallbackHint}
                onChangeText={(value) => updateField("fallbackHint", value)}
              />
            </View>
            {actionError ? (
              <Text style={styles.error} accessibilityRole="alert">
                {actionError}
              </Text>
            ) : null}

            <View style={styles.actions}>
              <Pressable
                style={[styles.secondaryButton, isSubmitting && styles.secondaryButtonDisabled]}
                onPress={handlePreview}
                disabled={isSubmitting}
              >
                <Text style={styles.secondaryButtonText}>{INTRO_AD_PAGE_UI.PREVIEW}</Text>
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
                  <Text style={styles.primaryButtonText}>{INTRO_AD_PAGE_UI.SUBMIT}</Text>
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
