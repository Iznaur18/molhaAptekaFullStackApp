import { useEffect, useState } from "react";

import {
  buildPatchSiteHeaderBannerSettingsBody,
  createEmptySiteHeaderBannerItem,
  mapSiteHeaderBannerSettingsToForm,
  validateSiteHeaderBannerAdminForm,
} from "../../../entities/site-header-banner/lib/siteHeaderBannerAdminForm.js";
import { usePatchSiteHeaderBannerSettingsMutation } from "../../../entities/site-header-banner/model/usePatchSiteHeaderBannerSettingsMutation.js";
import { useSiteHeaderBannerSettingsQuery } from "../../../entities/site-header-banner/model/useSiteHeaderBannerSettingsQuery.js";
import { SITE_HEADER_BANNER_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";

import "./SiteHeaderBannerAdminPage.css";

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

  const isLoading = settingsQuery.isPending;
  const isSaving = patchMutation.isPending;
  const loadError =
    settingsQuery.error instanceof Error
      ? settingsQuery.error.message
      : SITE_HEADER_BANNER_ADMIN_PAGE_UI.LOAD_ERROR;

  const updateGlobalEnabled = (enabled) => {
    setActionError("");
    setSaveNotice(false);
    setForm((prev) => ({ ...prev, enabled }));
  };

  const updateItem = (itemId, patch) => {
    setActionError("");
    setSaveNotice(false);
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    }));
  };

  const handleAddItem = () => {
    setActionError("");
    setSaveNotice(false);
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, createEmptySiteHeaderBannerItem()],
    }));
  };

  const handleRemoveItem = (itemId) => {
    setActionError("");
    setSaveNotice(false);
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
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
        <fieldset className="site-header-banner-admin__fieldset" disabled={isSaving}>
          <legend className="site-header-banner-admin__legend">
            {SITE_HEADER_BANNER_ADMIN_PAGE_UI.SECTION_GLOBAL}
          </legend>
          <label className="site-header-banner-admin__checkbox">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) => updateGlobalEnabled(event.target.checked)}
            />
            <span>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_ENABLED}</span>
          </label>
        </fieldset>

        <div className="site-header-banner-admin__items-header">
          <h3 className="site-header-banner-admin__items-title">
            {SITE_HEADER_BANNER_ADMIN_PAGE_UI.SECTION_ITEMS}
          </h3>
          <button
            type="button"
            className="site-header-banner-admin__btn site-header-banner-admin__btn_secondary"
            onClick={handleAddItem}
          >
            {SITE_HEADER_BANNER_ADMIN_PAGE_UI.ADD_ITEM}
          </button>
        </div>

        {form.items.length === 0 ? (
          <p className="site-header-banner-admin__empty">{SITE_HEADER_BANNER_ADMIN_PAGE_UI.EMPTY_ITEMS}</p>
        ) : null}

        {form.items.map((item, index) => (
          <fieldset
            key={item.id}
            className="site-header-banner-admin__fieldset site-header-banner-admin__item"
            disabled={isSaving}
          >
            <legend className="site-header-banner-admin__legend">
              {SITE_HEADER_BANNER_ADMIN_PAGE_UI.ITEM_TITLE(index + 1)}
            </legend>

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

            <ImageUrlField
              label={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_IMAGE}
              value={item.imageUrl}
              onChange={(value) => updateItem(item.id, { imageUrl: value })}
              hint={SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT_IMAGE}
            />

            <label className="site-header-banner-admin__label">
              <span>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_IMAGE_ALT}</span>
              <input
                className="site-header-banner-admin__input"
                value={item.imageAlt}
                onChange={(event) => updateItem(item.id, { imageAlt: event.target.value })}
                maxLength={200}
              />
            </label>

            <label className="site-header-banner-admin__label">
              <span>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_LINK_PATH}</span>
              <input
                className="site-header-banner-admin__input"
                value={item.linkPath}
                onChange={(event) => updateItem(item.id, { linkPath: event.target.value })}
                placeholder={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LINK_PATH_PLACEHOLDER}
              />
              <span className="site-header-banner-admin__field-hint">
                {SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT_LINK_PATH}
              </span>
            </label>

            <label className="site-header-banner-admin__label">
              <span>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_BACKGROUND_COLOR}</span>
              <input
                className="site-header-banner-admin__input"
                value={item.backgroundColor}
                onChange={(event) =>
                  updateItem(item.id, { backgroundColor: event.target.value })
                }
                placeholder="#RRGGBB"
              />
            </label>

            <button
              type="button"
              className="site-header-banner-admin__btn site-header-banner-admin__btn_danger"
              onClick={() => handleRemoveItem(item.id)}
            >
              {SITE_HEADER_BANNER_ADMIN_PAGE_UI.REMOVE_ITEM}
            </button>
          </fieldset>
        ))}

        {actionError ? (
          <p className="site-header-banner-admin__error" role="alert">
            {actionError}
          </p>
        ) : null}

        <div className="site-header-banner-admin__actions">
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
