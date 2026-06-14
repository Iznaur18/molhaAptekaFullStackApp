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
import {
  createIntroAdFormState,
  type IntroAdFormState,
} from "@/features/advertising-page/lib/mapIntroAdFormDefaults";
import { validateIntroAdForm } from "@/features/advertising-page/lib/validateIntroAdForm";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { VideoUrlUploadField } from "@/features/image-upload/ui/VideoUrlUploadField";
import { INTRO_AD_PAGE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAdvertisingCardStyles } from "@/shared/theme/sellerFlowStyles";

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
  const pricePoints = campaignQuery.data?.pricePoints ?? 30_000;
  const canCancel = campaign?.status === "pending" || campaign?.status === "queued";
  const hasOpenCampaign = Boolean(campaign);
  const isSubmitting = submitMutation.isPending || cancelMutation.isPending;

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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{INTRO_AD_PAGE_UI.CARD_TITLE}</Text>
      <Text style={styles.lead}>
        {INTRO_AD_PAGE_UI.DESCRIPTION}
      </Text>
      <Text style={styles.meta}>
        {INTRO_AD_PAGE_UI.PRICE(pricePoints)} · {INTRO_AD_PAGE_UI.DURATION}
      </Text>
      <Text style={styles.meta}>
        {INTRO_AD_PAGE_UI.BALANCE(loyaltyBalance)}
      </Text>

      {campaign ? (
        <View style={styles.statusPanel}>
          <Text style={styles.statusText}>{resolveStatusLabel(campaign.status)}</Text>
          {canCancel ? (
            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                void handleCancel();
              }}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>{INTRO_AD_PAGE_UI.CANCEL}</Text>
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
        <View style={styles.form}>
          <VideoUrlUploadField
            label="MP4"
            value={form.videoMp4Url}
            onChange={(value) => updateField("videoMp4Url", value)}
            disabled={isSubmitting}
          />
          <VideoUrlUploadField
            label="WebM (необязательно)"
            value={form.videoWebmUrl}
            onChange={(value) => updateField("videoWebmUrl", value)}
            disabled={isSubmitting}
          />
          <ImageUrlUploadField
            label="Poster"
            value={form.posterUrl}
            onChange={(value) => updateField("posterUrl", value)}
            disabled={isSubmitting}
          />
          <Text style={styles.fieldLabel}>Заголовок заглушки</Text>
          <TextInput
            style={styles.input}
            value={form.fallbackTitle}
            onChangeText={(value) => updateField("fallbackTitle", value)}
          />
          <Text style={styles.fieldLabel}>Подсказка заглушки</Text>
          <TextInput
            style={styles.input}
            value={form.fallbackHint}
            onChangeText={(value) => updateField("fallbackHint", value)}
          />
          <Text style={styles.sectionLabel}>{INTRO_AD_PAGE_UI.SECTION_TIMING}</Text>
          <Text style={styles.timingHint}>{INTRO_AD_PAGE_UI.TIMING_HINT}</Text>
          <Text style={styles.fieldLabel}>{INTRO_AD_PAGE_UI.LABEL_MIN_MS}</Text>
          <TextInput
            style={styles.input}
            value={form.minMs}
            onChangeText={(value) => updateField("minMs", value)}
            keyboardType="number-pad"
          />
          <Text style={styles.fieldLabel}>{INTRO_AD_PAGE_UI.LABEL_MAX_MS}</Text>
          <TextInput
            style={styles.input}
            value={form.maxMs}
            onChangeText={(value) => updateField("maxMs", value)}
            keyboardType="number-pad"
          />
          <Text style={styles.fieldLabel}>{INTRO_AD_PAGE_UI.LABEL_FADE_MS}</Text>
          <TextInput
            style={styles.input}
            value={form.fadeOutMs}
            onChangeText={(value) => updateField("fadeOutMs", value)}
            keyboardType="number-pad"
          />

          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={() => setShowForm(false)}>
              <Text style={styles.secondaryButtonText}>Отмена</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={handlePreview}>
              <Text style={styles.secondaryButtonText}>{INTRO_AD_PAGE_UI.PREVIEW}</Text>
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
                <Text style={styles.primaryButtonText}>{INTRO_AD_PAGE_UI.SUBMIT}</Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : null}

      {feedback ? <Text style={styles.success}>{feedback}</Text> : null}
      {actionError && hasOpenCampaign ? <Text style={styles.error}>{actionError}</Text> : null}
    </View>
  );
};
