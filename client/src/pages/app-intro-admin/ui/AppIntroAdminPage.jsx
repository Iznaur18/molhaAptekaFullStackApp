import { useEffect, useState } from "react";

import { buildPatchAppIntroSettingsBody } from "../../../entities/app-intro-settings/lib/buildPatchAppIntroSettingsBody.js";
import { mapAppIntroSettingsToForm } from "../../../entities/app-intro-settings/lib/mapAppIntroSettingsToForm.js";
import { useAppIntroSettingsQuery } from "../../../entities/app-intro-settings/model/useAppIntroSettingsQuery.js";
import { usePatchAppIntroSettingsMutation } from "../../../entities/app-intro-settings/model/usePatchAppIntroSettingsMutation.js";
import { useAppIntro } from "../../../features/app-intro/model/AppIntroContext.jsx";
import { APP_INTRO_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";
import { VideoUrlField } from "../../../shared/ui/VideoUrlField/VideoUrlField.jsx";
import { validateAppIntroAdminForm } from "../../../entities/intro-ad/lib/index.js";

import "./AppIntroAdminPage.css";

/**
 * @param {ReturnType<typeof mapAppIntroSettingsToForm>} form
 */
const formToPreviewSettings = (form) => {
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

export function AppIntroAdminPage() {
  const settingsQuery = useAppIntroSettingsQuery();
  const patchMutation = usePatchAppIntroSettingsMutation();
  const { previewIntro, replayIntro } = useAppIntro();

  const [form, setForm] = useState(() => mapAppIntroSettingsToForm(null));
  const [actionError, setActionError] = useState("");
  const [saveNotice, setSaveNotice] = useState(false);

  useEffect(() => {
    if (settingsQuery.data?.settings) {
      setForm(mapAppIntroSettingsToForm(settingsQuery.data.settings));
    }
  }, [settingsQuery.data]);

  const isLoading = settingsQuery.isPending;
  const isSaving = patchMutation.isPending;
  const loadError =
    settingsQuery.error instanceof Error
      ? settingsQuery.error.message
      : APP_INTRO_ADMIN_PAGE_UI.LOAD_ERROR;

  const updateField = (key, value) => {
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

  const handleSave = async (event) => {
    event.preventDefault();
    const validationError = validateAppIntroAdminForm(form);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    try {
      setActionError("");
      setSaveNotice(false);
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

  if (isLoading) {
    return <p className="app-intro-admin__status">{APP_INTRO_ADMIN_PAGE_UI.LOADING}</p>;
  }

  if (settingsQuery.isError) {
    return (
      <p className="app-intro-admin__error" role="alert">
        {loadError}
      </p>
    );
  }

  return (
    <section className="app-intro-admin">
      <header className="app-intro-admin__header">
        <h2 className="app-intro-admin__title">{APP_INTRO_ADMIN_PAGE_UI.TITLE}</h2>
        <p className="app-intro-admin__hint">{APP_INTRO_ADMIN_PAGE_UI.HINT}</p>
      </header>

      {saveNotice ? (
        <div className="app-intro-admin__notice" role="status">
          <p>{APP_INTRO_ADMIN_PAGE_UI.SAVE_SUCCESS}</p>
          <button
            type="button"
            className="app-intro-admin__notice-btn"
            onClick={handleWatchSaved}
          >
            {APP_INTRO_ADMIN_PAGE_UI.WATCH_AFTER_SAVE}
          </button>
        </div>
      ) : null}

      <form className="app-intro-admin__form" onSubmit={handleSave}>
        <fieldset className="app-intro-admin__fieldset" disabled={isSaving}>
          <legend className="app-intro-admin__legend">
            {APP_INTRO_ADMIN_PAGE_UI.SECTION_MEDIA}
          </legend>

          <label className="app-intro-admin__label">
            {APP_INTRO_ADMIN_PAGE_UI.LABEL_VIDEO_MP4}
            <VideoUrlField
              value={form.videoMp4Url}
              onChange={(value) => updateField("videoMp4Url", value)}
            />
            <span className="app-intro-admin__field-hint">
              {APP_INTRO_ADMIN_PAGE_UI.HINT_VIDEO_MP4}
            </span>
          </label>

          <label className="app-intro-admin__label">
            {APP_INTRO_ADMIN_PAGE_UI.LABEL_VIDEO_WEBM}
            <VideoUrlField
              value={form.videoWebmUrl}
              onChange={(value) => updateField("videoWebmUrl", value)}
            />
          </label>

          <label className="app-intro-admin__label">
            {APP_INTRO_ADMIN_PAGE_UI.LABEL_POSTER}
            <ImageUrlField
              value={form.posterUrl}
              onChange={(value) => updateField("posterUrl", value)}
            />
          </label>
        </fieldset>

        <fieldset className="app-intro-admin__fieldset" disabled={isSaving}>
          <legend className="app-intro-admin__legend">
            {APP_INTRO_ADMIN_PAGE_UI.SECTION_FALLBACK}
          </legend>

          <label className="app-intro-admin__label">
            {APP_INTRO_ADMIN_PAGE_UI.LABEL_FALLBACK_TITLE}
            <input
              className="app-intro-admin__input"
              type="text"
              value={form.fallbackTitle}
              onChange={(event) => updateField("fallbackTitle", event.target.value)}
              maxLength={80}
            />
          </label>

          <label className="app-intro-admin__label">
            {APP_INTRO_ADMIN_PAGE_UI.LABEL_FALLBACK_HINT}
            <input
              className="app-intro-admin__input"
              type="text"
              value={form.fallbackHint}
              onChange={(event) => updateField("fallbackHint", event.target.value)}
              maxLength={200}
            />
          </label>
        </fieldset>

        <fieldset className="app-intro-admin__fieldset" disabled={isSaving}>
          <legend className="app-intro-admin__legend">
            {APP_INTRO_ADMIN_PAGE_UI.SECTION_TIMING}
          </legend>

          <div className="app-intro-admin__timing-grid">
            <label className="app-intro-admin__label">
              {APP_INTRO_ADMIN_PAGE_UI.LABEL_MIN_MS}
              <input
                className="app-intro-admin__input"
                type="number"
                min={500}
                max={30000}
                step={100}
                value={form.minMs}
                onChange={(event) => updateField("minMs", event.target.value)}
              />
            </label>

            <label className="app-intro-admin__label">
              {APP_INTRO_ADMIN_PAGE_UI.LABEL_MAX_MS}
              <input
                className="app-intro-admin__input"
                type="number"
                min={1000}
                max={60000}
                step={100}
                value={form.maxMs}
                onChange={(event) => updateField("maxMs", event.target.value)}
              />
            </label>

            <label className="app-intro-admin__label">
              {APP_INTRO_ADMIN_PAGE_UI.LABEL_FADE_MS}
              <input
                className="app-intro-admin__input"
                type="number"
                min={100}
                max={2000}
                step={50}
                value={form.fadeOutMs}
                onChange={(event) => updateField("fadeOutMs", event.target.value)}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="app-intro-admin__fieldset" disabled={isSaving}>
          <legend className="app-intro-admin__legend">
            {APP_INTRO_ADMIN_PAGE_UI.SECTION_PRIORITY}
          </legend>
          <label className="app-intro-admin__checkbox">
            <input
              type="checkbox"
              checked={form.prioritizePlatformIntro}
              onChange={(event) =>
                updateField("prioritizePlatformIntro", event.target.checked)
              }
            />
            {APP_INTRO_ADMIN_PAGE_UI.LABEL_PRIORITIZE_PLATFORM_INTRO}
          </label>
          <p className="app-intro-admin__field-hint">
            {APP_INTRO_ADMIN_PAGE_UI.HINT_PRIORITIZE_PLATFORM_INTRO}
          </p>
        </fieldset>

        {actionError ? (
          <p className="app-intro-admin__error" role="alert">
            {actionError}
          </p>
        ) : null}

        <div className="app-intro-admin__actions">
          <button
            type="button"
            className="app-intro-admin__btn app-intro-admin__btn_secondary"
            onClick={handlePreview}
            disabled={isSaving}
          >
            {APP_INTRO_ADMIN_PAGE_UI.PREVIEW}
          </button>
          <button
            type="submit"
            className="app-intro-admin__btn app-intro-admin__btn_primary"
            disabled={isSaving}
          >
            {isSaving ? APP_INTRO_ADMIN_PAGE_UI.SAVING : APP_INTRO_ADMIN_PAGE_UI.SAVE}
          </button>
        </div>
      </form>
    </section>
  );
}
