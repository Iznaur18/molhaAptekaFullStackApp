import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  resolvePreviewSiteHeaderBannerSlidesFromForm,
  resolveSiteHeaderBannerColorInputValue,
} from "../../../entities/site-header-banner/lib/resolvePreviewSiteHeaderBannerSlidesFromForm.js";
import { SiteHeaderBannerCarousel } from "../../../entities/site-header-banner/ui/SiteHeaderBannerCarousel.jsx";
import {
  cancelSiteHeaderBannerCampaign,
  submitSiteHeaderBannerCampaign,
} from "../../../entities/site-header-banner-campaign/api/siteHeaderBannerCampaignApi.js";
import {
  buildSubmitSiteHeaderBannerCampaignBody,
  createEmptySiteHeaderBannerCampaignForm,
  validateSiteHeaderBannerCampaignForm,
} from "../../../entities/site-header-banner-campaign/lib/siteHeaderBannerCampaignForm.js";
import { useMySiteHeaderBannerCampaignQuery } from "../../../entities/site-header-banner-campaign/model/useMySiteHeaderBannerCampaignQuery.js";
import { siteHeaderBannerCampaignQueryKeys } from "../../../entities/site-header-banner-campaign/model/siteHeaderBannerCampaignQueryKeys.js";
import { loyaltyPointsQueryKeys } from "../../../entities/user/model/loyaltyPointsQueryKeys.js";
import { SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";

const DURATION_BADGE = "7 дней";

/**
 * @param {string | null | undefined} status
 */
function resolveCampaignStatusLabel(status) {
  if (status === "pending") {
    return SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.STATUS_PENDING;
  }
  if (status === "active") {
    return SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.STATUS_ACTIVE;
  }
  return "";
}

/**
 * @param {string | null | undefined} status
 */
function resolveStatusPanelClass(status) {
  if (status === "active") {
    return "advertising-page__status advertising-page__status_active";
  }
  if (status === "pending") {
    return "advertising-page__status advertising-page__status_pending";
  }
  return "advertising-page__status";
}

/**
 * @param {{
 *   isAuthorized: boolean;
 *   loyaltyBalance: number;
 * }} props
 */
export function SiteHeaderBannerAdvertisingSection({ isAuthorized, loyaltyBalance }) {
  const queryClient = useQueryClient();
  const campaignQuery = useMySiteHeaderBannerCampaignQuery({ enabled: isAuthorized });

  const [form, setForm] = useState(createEmptySiteHeaderBannerCampaignForm);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");

  const pricePoints = campaignQuery.data?.pricePoints ?? 7_000;
  const durationDays = campaignQuery.data?.durationDays ?? 7;

  const previewSlides = useMemo(
    () =>
      resolvePreviewSiteHeaderBannerSlidesFromForm({
        enabled: true,
        items: [
          {
            id: "preview",
            enabled: true,
            imageUrl: form.imageUrl,
            imageAlt: form.imageAlt,
            linkPath: form.linkPath,
            backgroundColor: form.backgroundColor,
          },
        ],
      }),
    [form],
  );

  const submitMutation = useMutation({
    mutationFn: submitSiteHeaderBannerCampaign,
    onSuccess: async (result) => {
      if (result.loyaltyPointsBalance != null) {
        queryClient.setQueryData(loyaltyPointsQueryKeys.all, {
          loyaltyPointsBalance: result.loyaltyPointsBalance,
        });
      }
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: siteHeaderBannerCampaignQueryKeys.myCampaign(),
        }),
        queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all }),
      ]);
      setShowForm(false);
      setShowPreview(false);
      setFeedback(SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.SUBMIT_SUCCESS);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSiteHeaderBannerCampaign,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: siteHeaderBannerCampaignQueryKeys.myCampaign(),
        }),
        queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all }),
      ]);
      setFeedback(SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CANCEL_SUCCESS);
    },
  });

  const campaign = campaignQuery.data?.campaign ?? null;
  const canCancel = campaign?.status === "pending";
  const hasOpenCampaign = Boolean(campaign);
  const isSubmitting = submitMutation.isPending || cancelMutation.isPending;

  const updateField = (key, value) => {
    setActionError("");
    setFeedback("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateSiteHeaderBannerCampaignForm(form);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    try {
      setActionError("");
      setFeedback("");
      await submitMutation.mutateAsync(buildSubmitSiteHeaderBannerCampaignBody(form));
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.SUBMIT_FALLBACK,
      );
    }
  };

  const handleCancel = async () => {
    if (!campaign?._id) {
      return;
    }
    try {
      setActionError("");
      setFeedback("");
      await cancelMutation.mutateAsync(campaign._id);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CANCEL_FALLBACK,
      );
    }
  };

  if (campaignQuery.isPending) {
    return (
      <article className="advertising-page__card advertising-page__card_banner">
        <h2 className="advertising-page__card-title">
          {SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CARD_TITLE}
        </h2>
        <p className="advertising-page__state">{SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.LOADING}</p>
      </article>
    );
  }

  if (campaignQuery.isError) {
    return (
      <article className="advertising-page__card advertising-page__card_banner">
        <h2 className="advertising-page__card-title">
          {SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CARD_TITLE}
        </h2>
        <p className="advertising-page__state advertising-page__state_error" role="alert">
          {campaignQuery.error instanceof Error
            ? campaignQuery.error.message
            : SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.FETCH_FALLBACK}
        </p>
      </article>
    );
  }

  return (
    <article className="advertising-page__card advertising-page__card_banner">
      <div className="advertising-page__card-head">
        <h2 className="advertising-page__card-title">
          {SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CARD_TITLE}
        </h2>
        <span className="advertising-page__card-badge">{DURATION_BADGE}</span>
      </div>

      <p className="advertising-page__lead">{SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.DESCRIPTION}</p>

      <div className="advertising-page__meta">
        <div className="advertising-page__meta-item">
          <span className="advertising-page__meta-label">Стоимость</span>
          <span className="advertising-page__meta-value">{pricePoints} баллов</span>
        </div>
        <div className="advertising-page__meta-item">
          <span className="advertising-page__meta-label">Срок</span>
          <span className="advertising-page__meta-value">{durationDays} дней</span>
        </div>
      </div>

      {campaign ? (
        <div className={resolveStatusPanelClass(campaign.status)}>
          <p className="advertising-page__status-text">
            {resolveCampaignStatusLabel(campaign.status)}
          </p>
          {canCancel ? (
            <button
              type="button"
              className="app-btn app-btn--cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CANCEL}
            </button>
          ) : null}
        </div>
      ) : null}

      {!hasOpenCampaign && !showForm ? (
        <button
          type="button"
          className="app-btn app-btn--primary"
          onClick={() => setShowForm(true)}
        >
          {SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.OPEN_FORM}
        </button>
      ) : null}

      {!hasOpenCampaign && showForm ? (
        <div className="advertising-page__panel">
          <p className="advertising-page__panel-title">Заявка на баннер в шапке</p>
          <form className="advertising-page__form" onSubmit={handleSubmit}>
            <ImageUrlField
              label="Изображение"
              value={form.imageUrl}
              onChange={(value) => updateField("imageUrl", value)}
            />
            <label className="advertising-page__field">
              Alt-текст
              <input
                className="advertising-page__input"
                value={form.imageAlt}
                onChange={(event) => updateField("imageAlt", event.target.value)}
              />
            </label>
            <label className="advertising-page__field">
              Ссылка (необязательно)
              <input
                className="advertising-page__input"
                value={form.linkPath}
                onChange={(event) => updateField("linkPath", event.target.value)}
                placeholder="/catalog или https://…"
              />
            </label>
            <label className="advertising-page__field">
              Цвет фона (необязательно)
              <div className="advertising-page__color-field">
                <input
                  type="color"
                  value={resolveSiteHeaderBannerColorInputValue(form.backgroundColor)}
                  onChange={(event) =>
                    updateField("backgroundColor", event.target.value.toLowerCase())
                  }
                />
                <input
                  className="advertising-page__input"
                  value={form.backgroundColor}
                  onChange={(event) => updateField("backgroundColor", event.target.value)}
                  placeholder="#RRGGBB"
                />
              </div>
            </label>
            {showPreview && previewSlides.length > 0 ? (
              <div className="advertising-page__preview">
                <SiteHeaderBannerCarousel slides={previewSlides} />
              </div>
            ) : null}
            {actionError ? (
              <p className="advertising-page__error" role="alert">
                {actionError}
              </p>
            ) : null}
            <div className="advertising-page__actions">
              <button
                type="button"
                className="app-btn app-btn--secondary"
                onClick={() => {
                  const validationError = validateSiteHeaderBannerCampaignForm(form);
                  if (validationError) {
                    setActionError(validationError);
                    return;
                  }
                  setShowPreview(true);
                }}
                disabled={isSubmitting}
              >
                {SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.PREVIEW}
              </button>
              <button
                type="submit"
                className="app-btn app-btn--primary"
                disabled={isSubmitting || loyaltyBalance < pricePoints}
              >
                {SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.SUBMIT}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {feedback ? (
        <p className="advertising-page__feedback" role="status">
          {feedback}
        </p>
      ) : null}
    </article>
  );
}
