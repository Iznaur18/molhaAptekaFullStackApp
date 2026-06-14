import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {
  buildPatchAppIntroSettingsBody,
  mapAppIntroSettingsToForm,
  type AppIntroAdminForm,
} from "@/entities/app-intro-settings/lib/appIntroAdminForm";
import { validateAppIntroAdminForm } from "@/entities/app-intro-settings/lib/validateAppIntroAdminForm";
import { usePatchAppIntroSettingsMutation } from "@/entities/app-intro-settings/model/usePatchAppIntroSettingsMutation";
import { useAppIntroSettingsQuery } from "@/entities/app-intro-settings/model/useAppIntroSettingsQuery";
import type { AppIntroSettings } from "@/entities/app-intro-settings/model/types";
import { useAppIntro } from "@/features/app-intro/model/AppIntroProvider";
import { ImageUrlUploadField } from "@/features/image-upload/ui/ImageUrlUploadField";
import { VideoUrlUploadField } from "@/features/image-upload/ui/VideoUrlUploadField";
import { APP_INTRO_ADMIN_PAGE_UI } from "@/shared/config";
import { useStaffAdminStyles } from "@/shared/theme/staffAdminStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const formToPreviewSettings = (form: AppIntroAdminForm): AppIntroSettings => {
  const body = buildPatchAppIntroSettingsBody(form);
  return {
    videoMp4Url: body.videoMp4Url,
    videoWebmUrl: body.videoWebmUrl,
    posterUrl: body.posterUrl,
    fallbackTitle: body.fallbackTitle ?? "",
    fallbackHint: body.fallbackHint ?? "",
    minMs: body.minMs,
    maxMs: body.maxMs,
    fadeOutMs: body.fadeOutMs,
    updatedAt: null,
  };
};

export const AppIntroAdminPage = () => {
  const styles = useStaffAdminStyles();
  const settingsQuery = useAppIntroSettingsQuery();
  const patchMutation = usePatchAppIntroSettingsMutation();
  const { previewIntro, replayIntro } = useAppIntro();

  const [form, setForm] = useState<AppIntroAdminForm>(() => mapAppIntroSettingsToForm(null));
  const [actionError, setActionError] = useState("");
  const [saveNotice, setSaveNotice] = useState(false);

  useEffect(() => {
    if (settingsQuery.data?.settings) {
      setForm(mapAppIntroSettingsToForm(settingsQuery.data.settings));
    }
  }, [settingsQuery.data]);

  const updateField = (key: keyof AppIntroAdminForm, value: string) => {
    setActionError("");
    setSaveNotice(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePreview = () => {
    const validationError = validateAppIntroAdminForm(form);
    if (validationError) {
      setActionError(validationError);
      return;
    }
    setActionError("");
    previewIntro(formToPreviewSettings(form));
  };

  const handleSave = async () => {
    const validationError = validateAppIntroAdminForm(form);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    setActionError("");
    try {
      const saved = await patchMutation.mutateAsync(buildPatchAppIntroSettingsBody(form));
      setForm(mapAppIntroSettingsToForm(saved.settings));
      setSaveNotice(true);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : APP_INTRO_ADMIN_PAGE_UI.SAVE_ERROR);
    }
  };

  if (settingsQuery.isPending) {
    return <ScreenLoadingState message={APP_INTRO_ADMIN_PAGE_UI.LOADING} />;
  }

  if (settingsQuery.isError) {
    return (
      <ScreenErrorState
        message={
          settingsQuery.error instanceof Error
            ? settingsQuery.error.message
            : APP_INTRO_ADMIN_PAGE_UI.LOAD_ERROR
        }
        onRetry={() => void settingsQuery.refetch()}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      {saveNotice ? (
        <View style={styles.notice}>
          <Text style={styles.success}>{APP_INTRO_ADMIN_PAGE_UI.SAVE_SUCCESS}</Text>
          <Pressable onPress={() => replayIntro()}>
            <Text style={styles.link}>{APP_INTRO_ADMIN_PAGE_UI.WATCH_AFTER_SAVE}</Text>
          </Pressable>
        </View>
      ) : null}

      <VideoUrlUploadField
        label={APP_INTRO_ADMIN_PAGE_UI.LABEL_VIDEO_MP4}
        value={form.videoMp4Url}
        onChange={(value) => updateField("videoMp4Url", value)}
      />
      <VideoUrlUploadField
        label={APP_INTRO_ADMIN_PAGE_UI.LABEL_VIDEO_WEBM}
        value={form.videoWebmUrl}
        onChange={(value) => updateField("videoWebmUrl", value)}
      />
      <ImageUrlUploadField
        label={APP_INTRO_ADMIN_PAGE_UI.LABEL_POSTER}
        value={form.posterUrl}
        onChange={(value) => updateField("posterUrl", value)}
      />

      <Text style={styles.labelLarge}>{APP_INTRO_ADMIN_PAGE_UI.LABEL_FALLBACK_TITLE}</Text>
      <TextInput
        style={styles.input}
        value={form.fallbackTitle}
        onChangeText={(value) => updateField("fallbackTitle", value)}
      />
      <Text style={styles.labelLarge}>{APP_INTRO_ADMIN_PAGE_UI.LABEL_FALLBACK_HINT}</Text>
      <TextInput
        style={styles.input}
        value={form.fallbackHint}
        onChangeText={(value) => updateField("fallbackHint", value)}
      />

      <Text style={styles.section}>{APP_INTRO_ADMIN_PAGE_UI.SECTION_TIMING}</Text>
      <Text style={styles.labelLarge}>{APP_INTRO_ADMIN_PAGE_UI.LABEL_MIN_MS}</Text>
      <TextInput
        style={styles.input}
        value={form.minMs}
        onChangeText={(value) => updateField("minMs", value)}
        keyboardType="number-pad"
      />
      <Text style={styles.labelLarge}>{APP_INTRO_ADMIN_PAGE_UI.LABEL_MAX_MS}</Text>
      <TextInput
        style={styles.input}
        value={form.maxMs}
        onChangeText={(value) => updateField("maxMs", value)}
        keyboardType="number-pad"
      />
      <Text style={styles.labelLarge}>{APP_INTRO_ADMIN_PAGE_UI.LABEL_FADE_MS}</Text>
      <TextInput
        style={styles.input}
        value={form.fadeOutMs}
        onChangeText={(value) => updateField("fadeOutMs", value)}
        keyboardType="number-pad"
      />

      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

      <View style={styles.actionsStretch}>
        <Pressable
          style={[styles.secondaryButtonFlex, patchMutation.isPending && styles.disabled]}
          onPress={handlePreview}
          disabled={patchMutation.isPending}
        >
          <Text style={styles.secondaryButtonText}>{APP_INTRO_ADMIN_PAGE_UI.PREVIEW}</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryButtonFlex, patchMutation.isPending && styles.disabled]}
          onPress={() => void handleSave()}
          disabled={patchMutation.isPending}
        >
          <Text style={styles.primaryButtonText}>
            {patchMutation.isPending
              ? APP_INTRO_ADMIN_PAGE_UI.SAVE_PENDING
              : APP_INTRO_ADMIN_PAGE_UI.SAVE}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};
