import { useCallback, useEffect, useState } from "react";

import {
  buildPatchSiteHeaderBannerSettingsBody,
  mapSiteHeaderBannerSettingsToForm,
  validateSiteHeaderBannerAdminForm,
  type SiteHeaderBannerAdminForm,
} from "@/entities/site-header-banner/lib/siteHeaderBannerAdminForm";
import { usePatchSiteHeaderBannerSettingsMutation } from "@/entities/site-header-banner/model/usePatchSiteHeaderBannerSettingsMutation";
import { useSiteHeaderBannerSettingsQuery } from "@/entities/site-header-banner/model/useSiteHeaderBannerSettingsQuery";
import { SITE_HEADER_BANNER_ADMIN_PAGE_UI } from "@/shared/config";

export const useSiteHeaderBannerAdminPage = () => {
  const settingsQuery = useSiteHeaderBannerSettingsQuery();
  const patchMutation = usePatchSiteHeaderBannerSettingsMutation();
  const [form, setForm] = useState<SiteHeaderBannerAdminForm>(() =>
    mapSiteHeaderBannerSettingsToForm(null),
  );
  const [actionError, setActionError] = useState("");
  const [saveNotice, setSaveNotice] = useState(false);

  useEffect(() => {
    if (settingsQuery.data) {
      setForm(mapSiteHeaderBannerSettingsToForm(settingsQuery.data));
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
      : SITE_HEADER_BANNER_ADMIN_PAGE_UI.LOAD_ERROR;

  const setFormState = useCallback((next: SiteHeaderBannerAdminForm) => {
    setActionError("");
    setSaveNotice(false);
    setForm(next);
  }, []);

  const handleSave = async () => {
    const validationError = validateSiteHeaderBannerAdminForm(form);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    setActionError("");
    setSaveNotice(false);
    try {
      const saved = await patchMutation.mutateAsync(buildPatchSiteHeaderBannerSettingsBody(form));
      setForm(mapSiteHeaderBannerSettingsToForm(saved));
      setSaveNotice(true);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : SITE_HEADER_BANNER_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    }
  };

  const reloadSettings = useCallback(async () => {
    setActionError("");
    try {
      await settingsQuery.refetch();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : SITE_HEADER_BANNER_ADMIN_PAGE_UI.LOAD_ERROR,
      );
    }
  }, [settingsQuery]);

  return {
    form,
    setFormState,
    phase,
    isSaving,
    queryError,
    actionError,
    saveNotice,
    handleSave,
    reloadSettings,
    refetchSettings: settingsQuery.refetch,
  };
};
