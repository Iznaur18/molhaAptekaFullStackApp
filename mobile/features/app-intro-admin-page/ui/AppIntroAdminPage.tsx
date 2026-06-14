import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

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

      <Text style={styles.label}>{APP_INTRO_ADMIN_PAGE_UI.LABEL_FALLBACK_TITLE}</Text>
      <TextInput
        style={styles.input}
        value={form.fallbackTitle}
        onChangeText={(value) => updateField("fallbackTitle", value)}
      />
      <Text style={styles.label}>{APP_INTRO_ADMIN_PAGE_UI.LABEL_FALLBACK_HINT}</Text>
      <TextInput
        style={styles.input}
        value={form.fallbackHint}
        onChangeText={(value) => updateField("fallbackHint", value)}
      />

      <Text style={styles.section}>{APP_INTRO_ADMIN_PAGE_UI.SECTION_TIMING}</Text>
      <Text style={styles.label}>{APP_INTRO_ADMIN_PAGE_UI.LABEL_MIN_MS}</Text>
      <TextInput
        style={styles.input}
        value={form.minMs}
        onChangeText={(value) => updateField("minMs", value)}
        keyboardType="number-pad"
      />
      <Text style={styles.label}>{APP_INTRO_ADMIN_PAGE_UI.LABEL_MAX_MS}</Text>
      <TextInput
        style={styles.input}
        value={form.maxMs}
        onChangeText={(value) => updateField("maxMs", value)}
        keyboardType="number-pad"
      />
      <Text style={styles.label}>{APP_INTRO_ADMIN_PAGE_UI.LABEL_FADE_MS}</Text>
      <TextInput
        style={styles.input}
        value={form.fadeOutMs}
        onChangeText={(value) => updateField("fadeOutMs", value)}
        keyboardType="number-pad"
      />

      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          style={[styles.secondaryButton, patchMutation.isPending && styles.disabled]}
          onPress={handlePreview}
          disabled={patchMutation.isPending}
        >
          <Text style={styles.secondaryButtonText}>{APP_INTRO_ADMIN_PAGE_UI.PREVIEW}</Text>
        </Pressable>
        <Pressable
          style={[styles.saveButton, patchMutation.isPending && styles.disabled]}
          onPress={() => void handleSave()}
          disabled={patchMutation.isPending}
        >
          <Text style={styles.saveText}>
            {patchMutation.isPending
              ? APP_INTRO_ADMIN_PAGE_UI.SAVE_PENDING
              : APP_INTRO_ADMIN_PAGE_UI.SAVE}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { padding: 16, gap: 12, paddingBottom: 32 },
  notice: { gap: 6, marginBottom: 4 },
  section: { fontSize: 16, fontWeight: "700", marginTop: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  saveButton: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "600" },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#eee",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: { fontWeight: "600" },
  disabled: { opacity: 0.6 },
  error: { color: "#c62828" },
  success: { color: "#2e7d32" },
  link: { color: "#1565c0", fontWeight: "600" },
});
