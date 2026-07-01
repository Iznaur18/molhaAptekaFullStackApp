import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  RAFFLE_PRIZE_MEDIA_TYPE_VIDEO,
} from "@/entities/raffle/lib/raffleConstants";
import {
  DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS,
} from "@/entities/raffle/lib/rafflePrizeImageFocus";
import { resolveRafflePrizeVideoUrl } from "@/entities/raffle/lib/resolveRafflePrizeVideoUrl";
import { useCreateRaffleMutation } from "@/entities/raffle/model/useCreateRaffleMutation";
import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { RafflePrizeMedia } from "@/entities/raffle/ui/RafflePrizeMedia";
import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { VideoUrlUploadField } from "@/features/image-upload/ui/VideoUrlUploadField";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import {
  CREATE_RAFFLE_MODAL_UI,
  CREATE_RAFFLE_PAGE_UI,
  MY_PROFILE_PAGE_UI,
} from "@/shared/config";
import { isDisplayableMediaUrl } from "@/shared/lib";
import { keepDigitsOnly } from "@/shared/lib/rubPriceInput";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCreateRafflePageStyles } from "@/shared/theme/createRafflePageStyles";

type PrizeMediaType = typeof RAFFLE_PRIZE_MEDIA_TYPE_IMAGE | typeof RAFFLE_PRIZE_MEDIA_TYPE_VIDEO;

type CreateRaffleFormState = {
  title: string;
  description: string;
  prizeMediaType: PrizeMediaType;
  prizeImageUrl: string;
  prizeVideoUrl: string;
  prizeImageFocus: { x: number; y: number };
  targetSales: string;
  instagramUrl: string;
};

const INITIAL_FORM: CreateRaffleFormState = {
  title: "",
  description: "",
  prizeMediaType: RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  prizeImageUrl: "",
  prizeVideoUrl: "",
  prizeImageFocus: { ...DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS },
  targetSales: "",
  instagramUrl: "",
};

const MediaTypeOption = ({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const styles = useCreateRafflePageStyles();

  return (
    <Pressable
      style={styles.mediaTypeOption}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: Boolean(disabled) }}
    >
      <View style={[styles.mediaTypeDot, selected && styles.mediaTypeDotActive]}>
        {selected ? <View style={styles.mediaTypeDotInner} /> : null}
      </View>
      <Text style={styles.mediaTypeOptionText}>{label}</Text>
    </Pressable>
  );
};

export const CreateRafflePage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useCreateRafflePageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const isAuthorized = useIsAuthorized();
  const { isUserDataConfirmed } = useUserAccess();
  const createMutation = useCreateRaffleMutation();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [form, setForm] = useState<CreateRaffleFormState>(INITIAL_FORM);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      setErrorMessage("");
      setSuccessMessage("");
    }, []),
  );

  const isVideoMedia = form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO;
  const isSubmitting = createMutation.isPending;

  const prizeFocusImageUrl = useMemo(() => {
    const url = resolveUploadedMediaUrl(form.prizeImageUrl);
    return isDisplayableMediaUrl(url) ? url : "";
  }, [form.prizeImageUrl]);

  const previewRaffle = useMemo<RaffleFromApi>(
    () => ({
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
    }),
    [form.prizeImageFocus, form.prizeImageUrl, form.prizeMediaType, form.prizeVideoUrl, form.title, form.targetSales],
  );

  const showPreview = useMemo(() => {
    if (isVideoMedia) {
      return Boolean(resolveRafflePrizeVideoUrl(previewRaffle));
    }
    return Boolean(prizeFocusImageUrl || form.prizeImageUrl.trim());
  }, [form.prizeImageUrl, isVideoMedia, previewRaffle, prizeFocusImageUrl]);

  const handleMediaTypeChange = (prizeMediaType: PrizeMediaType) => {
    setForm((prev) => ({
      ...prev,
      prizeMediaType,
      prizeImageUrl:
        prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO ? "" : prev.prizeImageUrl,
      prizeVideoUrl:
        prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_IMAGE ? "" : prev.prizeVideoUrl,
      prizeImageFocus:
        prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO
          ? { ...DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS }
          : prev.prizeImageFocus,
    }));
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.title.trim()) {
      setErrorMessage(CREATE_RAFFLE_PAGE_UI.ERROR_TITLE);
      return;
    }

    const targetSales = Number(form.targetSales);
    if (!Number.isFinite(targetSales) || targetSales < 1) {
      setErrorMessage(CREATE_RAFFLE_PAGE_UI.ERROR_TARGET);
      return;
    }

    if (!form.instagramUrl.trim()) {
      setErrorMessage(CREATE_RAFFLE_PAGE_UI.ERROR_INSTAGRAM);
      return;
    }

    if (isVideoMedia && !form.prizeVideoUrl.trim()) {
      setErrorMessage(CREATE_RAFFLE_PAGE_UI.ERROR_PRIZE_VIDEO);
      return;
    }

    if (!isVideoMedia && !form.prizeImageUrl.trim()) {
      setErrorMessage(CREATE_RAFFLE_PAGE_UI.ERROR_PRIZE_IMAGE);
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        prizeMediaType: form.prizeMediaType,
        prizeImageUrl: resolveUploadedMediaUrl(form.prizeImageUrl.trim()),
        prizeVideoUrl: resolveUploadedMediaUrl(form.prizeVideoUrl.trim()),
        prizeImageFocus: form.prizeImageFocus,
        targetSales,
        instagramUrl: form.instagramUrl.trim(),
      });
      setSuccessMessage(CREATE_RAFFLE_PAGE_UI.SUCCESS);
      setForm(INITIAL_FORM);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : CREATE_RAFFLE_PAGE_UI.SUBMIT_FALLBACK,
      );
    }
  };

  const hubChrome = (
    <>
      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="create-raffle"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{CREATE_RAFFLE_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginButtonText}>{CREATE_RAFFLE_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (!isUserDataConfirmed) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>
            <ProfileMobileSectionToggle
              activeLabel={MY_PROFILE_PAGE_UI.TAB_CREATE_RAFFLE}
              onPress={() => setNavSheetVisible(true)}
            />
          </View>
          <Text style={styles.state}>{CREATE_RAFFLE_PAGE_UI.CONFIRMED_DATA_REQUIRED}</Text>
        </View>
        {hubChrome}
      </>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          { paddingBottom: contentPaddingBottom },
        ]}
        accessibilityLabel={CREATE_RAFFLE_MODAL_UI.ARIA_DIALOG}
      >
        <View style={styles.header}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_CREATE_RAFFLE}
            onPress={() => setNavSheetVisible(true)}
          />
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{CREATE_RAFFLE_MODAL_UI.LABEL_TITLE} *</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              maxLength={120}
              onChangeText={(title) => setForm((prev) => ({ ...prev, title }))}
            />
            <Text style={styles.fieldHint}>{CREATE_RAFFLE_MODAL_UI.HINT_TITLE}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{CREATE_RAFFLE_MODAL_UI.LABEL_DESCRIPTION}</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.description}
              maxLength={4000}
              multiline
              onChangeText={(description) => setForm((prev) => ({ ...prev, description }))}
            />
            <Text style={styles.fieldHint}>{CREATE_RAFFLE_MODAL_UI.HINT_DESCRIPTION}</Text>
          </View>

          <View style={styles.mediaType}>
            <Text style={styles.mediaTypeLegend}>{CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_MEDIA}</Text>
            <View style={styles.mediaTypeOptions}>
              <MediaTypeOption
                label={CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_MEDIA_TYPE_IMAGE}
                selected={form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_IMAGE}
                onPress={() => handleMediaTypeChange(RAFFLE_PRIZE_MEDIA_TYPE_IMAGE)}
                disabled={isSubmitting}
              />
              <MediaTypeOption
                label={CREATE_RAFFLE_MODAL_UI.LABEL_PRIZE_MEDIA_TYPE_VIDEO}
                selected={form.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO}
                onPress={() => handleMediaTypeChange(RAFFLE_PRIZE_MEDIA_TYPE_VIDEO)}
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
                onChange={(prizeVideoUrl) => setForm((prev) => ({ ...prev, prizeVideoUrl }))}
                disabled={isSubmitting}
              />
            ) : (
              <ImageUrlUploadField
                label=""
                value={form.prizeImageUrl}
                onChange={(prizeImageUrl) => {
                  setForm((prev) => {
                    const urlChanged =
                      prizeImageUrl.trim() !== String(prev.prizeImageUrl ?? "").trim();
                    return {
                      ...prev,
                      prizeImageUrl,
                      prizeImageFocus: urlChanged
                        ? { ...DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS }
                        : prev.prizeImageFocus,
                    };
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

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{CREATE_RAFFLE_MODAL_UI.LABEL_TARGET} *</Text>
            <TextInput
              style={styles.input}
              value={form.targetSales}
              keyboardType="number-pad"
              onChangeText={(targetSales) =>
                setForm((prev) => ({ ...prev, targetSales: keepDigitsOnly(targetSales) }))
              }
            />
            <Text style={styles.fieldHint}>{CREATE_RAFFLE_MODAL_UI.HINT_TARGET}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{CREATE_RAFFLE_MODAL_UI.LABEL_INSTAGRAM} *</Text>
            <TextInput
              style={styles.input}
              value={form.instagramUrl}
              autoCapitalize="none"
              keyboardType="url"
              placeholder="https://instagram.com/..."
              placeholderTextColor={theme.colors.textMuted}
              onChangeText={(instagramUrl) => setForm((prev) => ({ ...prev, instagramUrl }))}
            />
            <Text style={styles.fieldHint}>{CREATE_RAFFLE_MODAL_UI.HINT_INSTAGRAM}</Text>
          </View>

          <Text style={styles.pageHint}>{CREATE_RAFFLE_MODAL_UI.HINT}</Text>

          {successMessage ? (
            <Text style={styles.success} accessibilityRole="text">
              {successMessage}
            </Text>
          ) : null}
          {errorMessage ? (
            <Text style={styles.error} accessibilityRole="alert">
              {errorMessage}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              style={[styles.submit, isSubmitting && styles.submitDisabled]}
              onPress={() => {
                void handleSubmit();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <Text style={styles.submitText}>{CREATE_RAFFLE_MODAL_UI.SUBMIT}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
      {hubChrome}
    </>
  );
};
