import { useCallback, useEffect, useState } from "react";

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
import { APP_INTRO_ADMIN_PAGE_UI } from "@/shared/config";

const formToPreviewSettings = (form: AppIntroAdminForm): AppIntroSettings => {
  const body = buildPatchAppIntroSettingsBody(form);
  return {
    videoMp4Url: body.videoMp4Url,
    videoWebmUrl: body.videoWebmUrl,
    posterUrl: body.posterUrl,
    fallbackTitle: body.fallbackTitle ?? "",
    fallbackHint: body.fallbackHint ?? "",
    minMs: Number(form.minMs) || 0,
    maxMs: Number(form.maxMs) || 0,
    fadeOutMs: Number(form.fadeOutMs) || 0,
    updatedAt: null,
  };
};

export const useAppIntroAdminPage = () => {
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

  const phase = settingsQuery.isPending
    ? "loading"
    : settingsQuery.isError
      ? "error"
      : "success";
  const isSaving = patchMutation.isPending;
  const queryError =
    settingsQuery.error instanceof Error
      ? settingsQuery.error.message
      : APP_INTRO_ADMIN_PAGE_UI.LOAD_ERROR;

  const updateField = (key: keyof AppIntroAdminForm, value: string | boolean) => {
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
    setSaveNotice(false);
    try {
      const saved = await patchMutation.mutateAsync(buildPatchAppIntroSettingsBody(form));
      setForm(mapAppIntroSettingsToForm(saved.settings));
      setSaveNotice(true);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : APP_INTRO_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    }
  };

  const handleWatchSaved = () => {
    replayIntro();
    setSaveNotice(false);
  };

  const refetchSettings = settingsQuery.refetch;

  const reloadSettings = useCallback(async () => {
    setActionError("");
    try {
      await refetchSettings();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : APP_INTRO_ADMIN_PAGE_UI.LOAD_ERROR,
      );
    }
  }, [refetchSettings]);

  return {
    form,
    phase,
    isSaving,
    queryError,
    actionError,
    saveNotice,
    updateField,
    handlePreview,
    handleSave,
    handleWatchSaved,
    reloadSettings,
    refetchSettings,
  };
};
