import { useEffect, useMemo, useState } from "react";

import {
  buildPatchSiteHeaderBannerSettingsBody,
  createEmptySiteHeaderBannerItem,
  mapSiteHeaderBannerSettingsToForm,
  validateSiteHeaderBannerAdminForm,
} from "../../../entities/site-header-banner/lib/siteHeaderBannerAdminForm.js";
import { resolvePreviewSiteHeaderBannerSlidesFromForm } from "../../../entities/site-header-banner/lib/resolvePreviewSiteHeaderBannerSlidesFromForm.js";
import { usePatchSiteHeaderBannerSettingsMutation } from "../../../entities/site-header-banner/model/usePatchSiteHeaderBannerSettingsMutation.js";
import { useSiteHeaderBannerSettingsQuery } from "../../../entities/site-header-banner/model/useSiteHeaderBannerSettingsQuery.js";
import { SiteHeaderBannerCarousel } from "../../../entities/site-header-banner/ui/SiteHeaderBannerCarousel.jsx";
import { SITE_HEADER_BANNER_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { ModalSectionTabs } from "../../../shared/ui/ModalSectionTabs/ModalSectionTabs.jsx";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";
import { ProductManageToggleDisplayAdminPage } from "../../product-manage-toggle-display-admin/ui/ProductManageToggleDisplayAdminPage.jsx";
import { ProductBadgeExplainAdminPage } from "../../product-badge-explain-admin/ui/ProductBadgeExplainAdminPage.jsx";
import {
  SITE_HEADER_BANNER_ADMIN_TAB_BADGES,
  SITE_HEADER_BANNER_ADMIN_TAB_BUTTONS,
  SITE_HEADER_BANNER_ADMIN_TAB_GUEST,
  SITE_HEADER_BANNER_ADMIN_TAB_SLIDES,
} from "../lib/siteHeaderBannerAdminTabs.js";
import { SiteHeaderBannerAdminSlideEditor } from "./SiteHeaderBannerAdminSlideEditor.jsx";
import { SiteHeaderBannerAdminSlideList } from "./SiteHeaderBannerAdminSlideList.jsx";

import "./SiteHeaderBannerAdminPage.css";

const ADMIN_TABS = [
  { id: SITE_HEADER_BANNER_ADMIN_TAB_SLIDES, label: SITE_HEADER_BANNER_ADMIN_PAGE_UI.TAB_SLIDES },
  { id: SITE_HEADER_BANNER_ADMIN_TAB_BUTTONS, label: SITE_HEADER_BANNER_ADMIN_PAGE_UI.TAB_BUTTONS },
  { id: SITE_HEADER_BANNER_ADMIN_TAB_GUEST, label: SITE_HEADER_BANNER_ADMIN_PAGE_UI.TAB_GUEST },
  { id: SITE_HEADER_BANNER_ADMIN_TAB_BADGES, label: SITE_HEADER_BANNER_ADMIN_PAGE_UI.TAB_BADGES },
];

const resolveNextSelectedSlideId = (items, removedId, currentId) => {
  if (currentId !== removedId) {
    return currentId;
  }
  if (items.length === 0) {
    return null;
  }
  const removedIndex = items.findIndex((item) => item.id === removedId);
  const nextItem = items[removedIndex] ?? items[removedIndex - 1] ?? items[0];
  return nextItem?.id ?? null;
};

export function SiteHeaderBannerAdminPage() {
  const settingsQuery = useSiteHeaderBannerSettingsQuery();
  const patchMutation = usePatchSiteHeaderBannerSettingsMutation();
  const [form, setForm] = useState(() => mapSiteHeaderBannerSettingsToForm(null));
  const [activeTab, setActiveTab] = useState(SITE_HEADER_BANNER_ADMIN_TAB_SLIDES);
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [saveNotice, setSaveNotice] = useState(false);

  useEffect(() => {
    if (settingsQuery.data) {
      setForm(mapSiteHeaderBannerSettingsToForm(settingsQuery.data));
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    if (form.items.length === 0) {
      setSelectedSlideId(null);
      return;
    }
    if (!selectedSlideId || !form.items.some((item) => item.id === selectedSlideId)) {
      setSelectedSlideId(form.items[0]?.id ?? null);
    }
  }, [form.items, selectedSlideId]);

  const previewSlides = useMemo(
    () => resolvePreviewSiteHeaderBannerSlidesFromForm(form),
    [form],
  );

  const selectedSlide = form.items.find((item) => item.id === selectedSlideId) ?? null;
  const selectedSlideIndex = selectedSlide
    ? form.items.findIndex((item) => item.id === selectedSlide.id)
    : -1;
  const isSaving = patchMutation.isPending;

  const resetDraftState = () => {
    setActionError("");
    setSaveNotice(false);
  };

  const updateItem = (itemId, patch) => {
    resetDraftState();
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    }));
  };

  const handleAddSlide = () => {
    const nextItem = createEmptySiteHeaderBannerItem();
    resetDraftState();
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, nextItem],
    }));
    setSelectedSlideId(nextItem.id);
    setActiveTab(SITE_HEADER_BANNER_ADMIN_TAB_SLIDES);
  };

  const handleRemoveSlide = (itemId) => {
    resetDraftState();
    setForm((prev) => {
      const nextItems = prev.items.filter((entry) => entry.id !== itemId);
      setSelectedSlideId((currentId) => resolveNextSelectedSlideId(nextItems, itemId, currentId));
      return { ...prev, items: nextItems };
    });
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

  if (settingsQuery.isPending) {
    return <p className="site-header-banner-admin__status">{SITE_HEADER_BANNER_ADMIN_PAGE_UI.LOADING}</p>;
  }

  if (settingsQuery.isError) {
    return (
      <p className="site-header-banner-admin__error" role="alert">
        {settingsQuery.error instanceof Error
          ? settingsQuery.error.message
          : SITE_HEADER_BANNER_ADMIN_PAGE_UI.LOAD_ERROR}
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
        <ModalSectionTabs
          className="modal-section-tabs_in-header"
          tabs={ADMIN_TABS}
          activeTabId={activeTab}
          ariaLabel={SITE_HEADER_BANNER_ADMIN_PAGE_UI.TABS_ARIA}
          onTabChange={setActiveTab}
        />
      </header>

      {saveNotice ? (
        <div className="site-header-banner-admin__notice" role="status">
          <p>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.SAVE_SUCCESS}</p>
        </div>
      ) : null}

      {activeTab === SITE_HEADER_BANNER_ADMIN_TAB_BUTTONS ? (
        <div className="site-header-banner-admin__tab-panel">
          <ProductManageToggleDisplayAdminPage embedded />
        </div>
      ) : null}

      {activeTab === SITE_HEADER_BANNER_ADMIN_TAB_BADGES ? (
        <div className="site-header-banner-admin__tab-panel">
          <ProductBadgeExplainAdminPage embedded />
        </div>
      ) : null}

      {activeTab === SITE_HEADER_BANNER_ADMIN_TAB_SLIDES ||
      activeTab === SITE_HEADER_BANNER_ADMIN_TAB_GUEST ? (
      <form className="site-header-banner-admin__form" onSubmit={handleSave}>
        {activeTab === SITE_HEADER_BANNER_ADMIN_TAB_SLIDES ? (
          <div className="site-header-banner-admin__tab-panel">
            <div className="site-header-banner-admin__panel site-header-banner-admin__panel-section site-header-banner-admin__toolbar">
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
                onClick={handleAddSlide}
              >
                {SITE_HEADER_BANNER_ADMIN_PAGE_UI.ADD_ITEM}
              </button>
            </div>

            <div className="site-header-banner-admin__preview-card">
              <div className="site-header-banner-admin__preview-card-head">
                <h3 className="site-header-banner-admin__section-title">
                  {SITE_HEADER_BANNER_ADMIN_PAGE_UI.SECTION_PREVIEW}
                </h3>
                <p className="site-header-banner-admin__field-hint">
                  {SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT_PREVIEW}
                </p>
              </div>
              {previewSlides.length > 0 ? (
                <div className="site-header-banner-admin__preview">
                  <SiteHeaderBannerCarousel slides={previewSlides} />
                </div>
              ) : (
                <p className="site-header-banner-admin__preview-empty">
                  {SITE_HEADER_BANNER_ADMIN_PAGE_UI.PREVIEW_EMPTY}
                </p>
              )}
            </div>

            <div className="site-header-banner-admin__slides-layout">
              <aside className="site-header-banner-admin__slides-sidebar">
                <h3 className="site-header-banner-admin__section-title">
                  {SITE_HEADER_BANNER_ADMIN_PAGE_UI.SECTION_ITEMS}
                </h3>
                <p className="site-header-banner-admin__field-hint">
                  {SITE_HEADER_BANNER_ADMIN_PAGE_UI.SELECT_SLIDE_HINT}
                </p>
                <SiteHeaderBannerAdminSlideList
                  items={form.items}
                  selectedItemId={selectedSlideId}
                  disabled={isSaving}
                  onSelect={setSelectedSlideId}
                />
              </aside>

              <div className="site-header-banner-admin__slides-main">
                {selectedSlide && selectedSlideIndex >= 0 ? (
                  <SiteHeaderBannerAdminSlideEditor
                    item={selectedSlide}
                    index={selectedSlideIndex}
                    disabled={isSaving}
                    onChange={(patch) => updateItem(selectedSlide.id, patch)}
                    onRemove={() => handleRemoveSlide(selectedSlide.id)}
                  />
                ) : (
                  <div className="site-header-banner-admin__slide-editor-empty">
                    <p>{SITE_HEADER_BANNER_ADMIN_PAGE_UI.NO_SLIDE_SELECTED}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === SITE_HEADER_BANNER_ADMIN_TAB_GUEST ? (
          <div className="site-header-banner-admin__tab-panel">
            <div className="site-header-banner-admin__panel site-header-banner-admin__panel-section">
              <h3 className="site-header-banner-admin__section-title">
                {SITE_HEADER_BANNER_ADMIN_PAGE_UI.TAB_GUEST}
              </h3>
              <p className="site-header-banner-admin__field-hint">
                {SITE_HEADER_BANNER_ADMIN_PAGE_UI.HINT_GUEST_PROFILE}
              </p>
              <ImageUrlField
                label={SITE_HEADER_BANNER_ADMIN_PAGE_UI.LABEL_GUEST_PROFILE_LOGIN_MENU_BANNER_IMAGE}
                value={form.guestProfileLoginMenuBannerImageUrl}
                disabled={isSaving}
                onChange={(value) => {
                  resetDraftState();
                  setForm((prev) => ({
                    ...prev,
                    guestProfileLoginMenuBannerImageUrl: value,
                  }));
                }}
              />
            </div>
          </div>
        ) : null}

        {actionError ? (
          <p className="site-header-banner-admin__panel site-header-banner-admin__panel-section site-header-banner-admin__error" role="alert">
            {actionError}
          </p>
        ) : null}

        <div className="site-header-banner-admin__save-bar">
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
      ) : null}
    </section>
  );
}
