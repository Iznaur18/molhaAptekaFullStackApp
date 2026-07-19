import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import {
  RAFFLE_DESCRIPTION_MAX_LENGTH,
  RAFFLE_TITLE_MAX_LENGTH,
} from "@molha/api-contract";

import {
  RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  RAFFLE_PRIZE_MEDIA_TYPE_VIDEO,
} from "@/entities/raffle/lib/raffleConstants";
import { DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS } from "@/entities/raffle/lib/rafflePrizeImageFocus";
import { resolveRafflePrizeVideoUrl } from "@/entities/raffle/lib/resolveRafflePrizeVideoUrl";
import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { RafflePrizeMedia } from "@/entities/raffle/ui/RafflePrizeMedia";
import type {
  CreateRaffleFormState,
  PrizeMediaType,
} from "@/features/create-raffle-page/lib/createRaffleForm";
import type { CreateRaffleWizardStepId } from "@/features/create-raffle-page/lib/createRaffleWizardSteps";
import { CreateRaffleFormSection } from "@/features/create-raffle-page/ui/CreateRaffleFormSection";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { VideoUrlUploadField } from "@/features/image-upload/ui/VideoUrlUploadField";
import { CREATE_RAFFLE_MODAL_UI } from "@/shared/config";
import { isDisplayableMediaUrl } from "@/shared/lib";
import { keepDigitsOnly } from "@/shared/lib/rubPriceInput";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCreateRafflePageStyles } from "@/shared/theme/createRafflePageStyles";

type MediaTypeOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

const MediaTypeOption = ({ label, selected, onPress, disabled = false }: MediaTypeOptionProps) => {
  const styles = useCreateRafflePageStyles();

  return (
    <Pressable
      style={styles.mediaTypeOption}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
    >
      <View style={[styles.mediaTypeDot, selected && styles.mediaTypeDotActive]}>
        {selected ? <View style={styles.mediaTypeDotInner} /> : null}
      </View>
      <Text style={styles.mediaTypeOptionText}>{label}</Text>
    </Pressable>
  );
};

type CreateRaffleFormBodyProps = {
  form: CreateRaffleFormState;
  onFormChange: (patch: Partial<CreateRaffleFormState>) => void;
  onMediaTypeChange: (prizeMediaType: PrizeMediaType) => void;
  isSubmitting: boolean;
  hintText?: string | null;
  errorMessage?: string;
  submitLabel?: string;
  onSubmit?: () => void;
  /** `all` = edit/legacy single page; иначе один шаг wizard. */
  step?: CreateRaffleWizardStepId | "all";
  showFooter?: boolean;
};

export const CreateRaffleFormBody = ({
  form,
  onFormChange,
  onMediaTypeChange,
  isSubmitting,
  hintText = null,
  errorMessage = "",
  submitLabel = "",
  onSubmit,
  step = "all",
  showFooter = true,
}: CreateRaffleFormBodyProps) => {
  const theme = useAppTheme();
  const styles = useCreateRafflePageStyles();
  const isVideoMedia = form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO;
  const showBasic = step === "all" || step === "basic";
  const showPrize = step === "all" || step === "prize";
  const showConditions = step === "all" || step === "conditions";

  const prizeFocusImageUrl = isDisplayableMediaUrl(resolveUploadedMediaUrl(form.prizeImageUrl))
    ? resolveUploadedMediaUrl(form.prizeImageUrl)
    : "";

  const previewRaffle: RaffleFromApi = {
    _id: "preview",
    sellerId: "preview",
    title: form.title,
    prizeMediaType: form.prizeMediaType,
    prizeImageUrl: resolveUploadedMediaUrl(form.prizeImageUrl.trim()),
    prizeVideoUrl: resolveUploadedMediaUrl(form.prizeVideoUrl.trim()),
    prizeImageFocus: form.prizeImageFocus,
    targetSales: Number(form.targetSales) || 1,
    salesProgress: 0,
    status: "pending_staff",
  };

  const showPreview = isVideoMedia
    ? Boolean(resolveRafflePrizeVideoUrl(previewRaffle))
    : Boolean(prizeFocusImageUrl || form.prizeImageUrl.trim());

  return (
    <View style={styles.form}>
      {showBasic ? (
      <CreateRaffleFormSection title={CREATE_RAFFLE_MODAL_UI.SECTION_BASIC} hideTitle={step !== "all"}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{CREATE_RAFFLE_MODAL_UI.LABEL_TITLE} *</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            maxLength={RAFFLE_TITLE_MAX_LENGTH}
            onChangeText={(title) => onFormChange({ title })}
            editable={!isSubmitting}
          />
          <Text style={styles.fieldHint}>{CREATE_RAFFLE_MODAL_UI.HINT_TITLE}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{CREATE_RAFFLE_MODAL_UI.LABEL_DESCRIPTION}</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={form.description}
            maxLength={RAFFLE_DESCRIPTION_MAX_LENGTH}
            multiline
            onChangeText={(description) => onFormChange({ description })}
            editable={!isSubmitting}
          />
          <Text style={styles.fieldHint}>{CREATE_RAFFLE_MODAL_UI.HINT_DESCRIPTION}</Text>
        </View>
      </CreateRaffleFormSection>
      ) : null}

      {showPrize ? (
      <CreateRaffleFormSection title={CREATE_RAFFLE_MODAL_UI.SECTION_PRIZE} hideTitle={step !== "all"}>
        <View style={styles.mediaType}>
          <Text style={styles.mediaTypeLegend}>{CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_MEDIA}</Text>
          <View style={styles.mediaTypeOptions}>
            <MediaTypeOption
              label={CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_MEDIA_TYPE_IMAGE}
              selected={form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_IMAGE}
              onPress={() => onMediaTypeChange(RAFFLE_PRIZE_MEDIA_TYPE_IMAGE)}
              disabled={isSubmitting}
            />
            <MediaTypeOption
              label={CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_MEDIA_TYPE_VIDEO}
              selected={form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO}
              onPress={() => onMediaTypeChange(RAFFLE_PRIZE_MEDIA_TYPE_VIDEO)}
              disabled={isSubmitting}
            />
          </View>
          <Text style={styles.fieldHint}>{CREATE_RAFFLE_MODAL_UI.HINT_PRIZE_MEDIA}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>
            {isVideoMedia
              ? `${CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_VIDEO} *`
              : `${CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_IMAGE} *`}
          </Text>
          {isVideoMedia ? (
            <VideoUrlUploadField
              label=""
              value={form.prizeVideoUrl}
              onChange={(prizeVideoUrl) => onFormChange({ prizeVideoUrl })}
              disabled={isSubmitting}
            />
          ) : (
            <ImageUrlUploadField
              label=""
              value={form.prizeImageUrl}
              onChange={(prizeImageUrl) => {
                const urlChanged = prizeImageUrl.trim() !== form.prizeImageUrl.trim();
                onFormChange({
                  prizeImageUrl,
                  prizeImageFocus: urlChanged
                    ? { ...DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS }
                    : form.prizeImageFocus,
                });
              }}
              disabled={isSubmitting}
            />
          )}
          <Text style={styles.fieldHint}>
            {isVideoMedia
              ? CREATE_RAFFLE_MODAL_UI.HINT_PRIZE_VIDEO
              : CREATE_RAFFLE_MODAL_UI.HINT_PRIZE_IMAGE}
          </Text>
        </View>

        {showPreview ? (
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>{CREATE_RAFFLE_MODAL_UI.PREVIEW_LABEL}</Text>
            <View style={styles.previewFrame}>
              <RafflePrizeMedia raffle={previewRaffle} />
            </View>
          </View>
        ) : null}
      </CreateRaffleFormSection>
      ) : null}

      {showConditions ? (
      <CreateRaffleFormSection
        title={CREATE_RAFFLE_MODAL_UI.SECTION_CONDITIONS}
        hideTitle={step !== "all"}
      >
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{CREATE_RAFFLE_MODAL_UI.LABEL_TARGET} *</Text>
          <TextInput
            style={styles.input}
            value={form.targetSales}
            keyboardType="number-pad"
            onChangeText={(targetSales) =>
              onFormChange({ targetSales: keepDigitsOnly(targetSales) })
            }
            editable={!isSubmitting}
          />
          <Text style={styles.fieldHint}>{CREATE_RAFFLE_MODAL_UI.HINT_TARGET}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{CREATE_RAFFLE_MODAL_UI.LABEL_INSTAGRAM}</Text>
          <TextInput
            style={styles.input}
            value={form.instagramUrl}
            autoCapitalize="none"
            keyboardType="url"
            placeholder="https://instagram.com/..."
            placeholderTextColor={theme.colors.textMuted}
            onChangeText={(instagramUrl) => onFormChange({ instagramUrl })}
            editable={!isSubmitting}
          />
          <Text style={styles.fieldHint}>{CREATE_RAFFLE_MODAL_UI.HINT_INSTAGRAM}</Text>
        </View>
      </CreateRaffleFormSection>
      ) : null}

      {hintText ? <Text style={styles.pageHint}>{hintText}</Text> : null}
      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}

      {showFooter && onSubmit ? (
      <View style={styles.actions}>
        <Pressable
          style={[styles.submit, isSubmitting && styles.submitDisabled]}
          onPress={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.colors.onContrast} />
          ) : (
            <Text style={styles.submitText}>{submitLabel}</Text>
          )}
        </Pressable>
      </View>
      ) : null}
    </View>
  );
};
