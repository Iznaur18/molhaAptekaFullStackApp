import { useEffect, useMemo, useState } from "react";

import {
  buildPatchSiteHeaderBannerSettingsBody,
  createEmptySiteHeaderBannerItem,
  mapSiteHeaderBannerSettingsToForm,
  validateSiteHeaderBannerAdminForm,
} from "../../../entities/site-header-banner/lib/siteHeaderBannerAdminForm.js";
import {
  normalizeSiteHeaderBannerHexColor,
  resolvePreviewSiteHeaderBannerSlidesFromForm,
  resolveSiteHeaderBannerColorInputValue,
} from "../../../entities/site-header-banner/lib/resolvePreviewSiteHeaderBannerSlidesFromForm.js";
import { usePatchSiteHeaderBannerSettingsMutation } from "../../../entities/site-header-banner/model/usePatchSiteHeaderBannerSettingsMutation.js";
import { useSiteHeaderBannerSettingsQuery } from "../../../entities/site-header-banner/model/useSiteHeaderBannerSettingsQuery.js";
import { SiteHeaderBannerCarousel } from "../../../entities/site-header-banner/ui/SiteHeaderBannerCarousel.jsx";
import { SITE_HEADER_BANNER_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";

import "./SiteHeaderBannerAdminPage.css";

/**
 * @param {{
 *   value: string;
 *   disabled?: boolean;
 *   onChange: (value: string) => void;
 * }} props
 */
function SiteHeaderBannerColorField({ value, disabled = false, onChange }) {
  return (
    <div className="site-header-banner-admin__color-field">
      <input
        className="site-header-banner-admin__color-picker"
        type="color"
        value={resolveSiteHeaderBannerColorInputValue(value)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value.toLowerCase())}
        aria-label={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_BACKGROUND_COLOR}
      />
      <input
        className="site-header-banner-admin__input"
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="#RRGGBB"
        spellCheck={false}
      />
    </div>
  );
}

export function SiteHeaderBannerAdminPage() {
  const settingsQuery = useSiteHeaderBannerSettingsQuery();
  const patchMutation = usePatchSiteHeaderBannerSettingsMutation();
  const [form, setForm] = useState(() => mapSiteHeaderBannerSettingsToForm(null));
  const [actionError, setActionError] = useState("");
  const [saveNotice, setSaveNotice] = useState(false);

  useEffect(() => {
    if (settingsQuery.data) {
      setForm(mapSiteHeaderBannerSettingsToForm(settingsQuery.data));
    }
  }, [settingsQuery.data]);

  const previewSlides = useMemo(
    () => resolvePreviewSiteHeaderBannerSlidesFromForm(form),
    [form],
  );

  const isLoading = settingsQuery.isPending;
  const isSaving = patchMutation.isPending;
  const loadError =
    settingsQuery.error instanceof Error
      ? settingsQuery.error.message
      : SITE_HEADER_BANNER_ADMIN_PAGE_UI.LOAD_ERROR;

  const resetDraftState = () => {
    setActionError("");
    setSaveNotice(false);
  };

  const updateItem = (itemId, patch) => {
    resetDraftState();
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const validationError = validateSiteHeaderBannerAdminForm(form);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    try {
      setActionError("");
      setSaveNotice(false);
      const saved = await patchMutation.mutateAsync(
        buildPatchSiteHeaderBannerSettingsBody(form),
      );
      setForm(mapSiteHeaderBannerSettingsToForm(saved.settings));
      setSaveNotice(true);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : SITE_HEADER_BANNER_ADMIN_PAGE_UI.SAVE_ERROR,
      );
    }
  };

  if (isLoading) {
    return <p className="site-header-banner-admin__status">{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LOADING}</p>;
  }

  if (settingsQuery.isError) {
    return (
      <p className="site-header-banner-admin__error" role="alert">
        {loadError}
      </p>
    );
  }

  return (
    <section className="site-header-banner-admin">
      <header className="site-header-banner-admin__header">
        <h2 className="site-header-banner-admin__title">
          {SITE_HEADER_BANNER_ADMIN_PAGE_UI.TITLE}
        </h2>
        <p className="site-header-banner-admin__hint">{SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT}</p>
      </header>

      {saveNotice ? (
        <div className="site-header-banner-admin__notice" role="status">
          <p>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.SAVE_SUCCESS}</p>
        </div>
      ) : null}

      <form className="site-header-banner-admin__form" onSubmit={handleSave}>
        <div className="site-header-banner-admin__panel">
          <div className="site-header-banner-admin__panel-section site-header-banner-admin__toolbar">
            <label className="site-header-banner-admin__checkbox">
            <input
              type="checkbox"
              checked={form.enabled}
              disabled={isSaving}
              onChange={(event) => {
                resetDraftState();
                setForm((prev) => ({ ...prev, enabled: event.target.checked }));
              }}
            />
            <span>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_ENABLED}</span>
          </label>
          <button
            type="button"
            className="site-header-banner-admin__btn site-header-banner-admin__btn_secondary"
            disabled={isSaving}
            onClick={() => {
              resetDraftState();
              setForm((prev) => ({
                ...prev,
                items: [...prev.items, createEmptySiteHeaderBannerItem()],
              }));
            }}
          >
            {SITE_HEADER_BANNER_ADMIN_PAGE_UI.ADD_ITEM}
          </button>
          </div>

        {previewSlides.length > 0 ? (
          <div className="site-header-banner-admin__panel-section site-header-banner-admin__preview">
            <SiteHeaderBannerCarousel slides={previewSlides} />
          </div>
        ) : null}

        {form.items.length === 0 ? (
          <p className="site-header-banner-admin__panel-section site-header-banner-admin__empty">
            {SITE_HEADER_BANNER_ADMIN_PAGE_UI.EMPTY_ITEMS}
          </p>
        ) : null}
        </div>

        {form.items.map((item, index) => (
          <div
            key={item.id}
            className={[
              "site-header-banner-admin__slide-zone",
              isSaving ? "site-header-banner-admin__slide-zone_disabled" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-disabled={isSaving || undefined}
          >
            <div className="site-header-banner-admin__slide-title">
              {SITE_HEADER_BANNER_ADMIN_PAGE_UI.ITEM_TITLE(index + 1)}
            </div>

            <div className="site-header-banner-admin__field-block">
              <label className="site-header-banner-admin__checkbox">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(event) =>
                  updateItem(item.id, { enabled: event.target.checked })
                }
              />
              <span>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_ITEM_ENABLED}</span>
            </label>
            </div>

            <div className="site-header-banner-admin__field-block">
            <ImageUrlField
              label={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_IMAGE}
              value={item.imageUrl}
              onChange={(value) => updateItem(item.id, { imageUrl: value })}
            />
            </div>

            <div className="site-header-banner-admin__field-block">
            <label className="site-header-banner-admin__label">
              <span>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_IMAGE_ALT}</span>
              <input
                className="site-header-banner-admin__input"
                value={item.imageAlt}
                onChange={(event) => updateItem(item.id, { imageAlt: event.target.value })}
                maxLength={200}
              />
            </label>
            </div>

            <div className="site-header-banner-admin__field-block">
            <label className="site-header-banner-admin__label">
              <span>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_LINK_PATH}</span>
              <input
                className="site-header-banner-admin__input"
                value={item.linkPath}
                onChange={(event) => updateItem(item.id, { linkPath: event.target.value })}
                placeholder={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LINK_PATH_PLACEHOLDER}
              />
            </label>
            </div>

            <div className="site-header-banner-admin__field-block">
            <label className="site-header-banner-admin__label">
              <span>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_BACKGROUND_COLOR}</span>
              <SiteHeaderBannerColorField
                value={item.backgroundColor}
                disabled={isSaving}
                onChange={(backgroundColor) => {
                  const normalized = normalizeSiteHeaderBannerHexColor(backgroundColor);
                  updateItem(item.id, {
                    backgroundColor: normalized ?? backgroundColor,
                  });
                }}
              />
            </label>
            </div>

            <div className="site-header-banner-admin__field-block site-header-banner-admin__field-block_actions">
            <button
              type="button"
              className="site-header-banner-admin__btn site-header-banner-admin__btn_danger"
              onClick={() => {
                resetDraftState();
                setForm((prev) => ({
                  ...prev,
                  items: prev.items.filter((entry) => entry.id !== item.id),
                }));
              }}
            >
              {SITE_HEADER_BANNER_ADMIN_PAGE_UI.REMOVE_ITEM}
            </button>
            </div>
          </div>
        ))}

        {actionError ? (
          <p className="site-header-banner-admin__panel site-header-banner-admin__panel-section site-header-banner-admin__error" role="alert">
            {actionError}
          </p>
        ) : null}

        <div className="site-header-banner-admin__panel site-header-banner-admin__panel-section site-header-banner-admin__actions">
          <button
            type="submit"
            className="site-header-banner-admin__btn site-header-banner-admin__btn_primary"
            disabled={isSaving}
          >
            {isSaving
              ? SITE_HEADER_BANNER_ADMIN_PAGE_UI.SAVING
              : SITE_HEADER_BANNER_ADMIN_PAGE_UI.SAVE}
          </button>
        </div>
      </form>
    </section>
  );
}
