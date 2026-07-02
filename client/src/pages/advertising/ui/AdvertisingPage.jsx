import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { mapAppIntroSettingsToForm } from "../../../entities/app-intro-settings/lib/mapAppIntroSettingsToForm.js";
import {
  cancelIntroAdCampaign,
  submitIntroAdCampaign,
} from "../../../entities/intro-ad/api/submitIntroAdCampaign.js";
import { introAdQueryKeys } from "../../../entities/intro-ad/model/introAdQueryKeys.js";
import { useMyIntroAdCampaignQuery } from "../../../entities/intro-ad/model/useMyIntroAdCampaignQuery.js";
import { useMyLoyaltyPointsStatusQuery } from "../../../entities/user/model/useMyLoyaltyPointsStatusQuery.js";
import { loyaltyPointsQueryKeys } from "../../../entities/user/model/loyaltyPointsQueryKeys.js";
import { useAppIntro } from "../../../features/app-intro/model/AppIntroContext.jsx";
import {
  ADVERTISING_PAGE_UI,
  INTRO_AD_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";
import { VideoUrlField } from "../../../shared/ui/VideoUrlField/VideoUrlField.jsx";
import {
  buildSubmitIntroAdCampaignBody,
  formToIntroAdPreviewSettings,
  validateAppIntroAdminForm,
} from "../../../entities/intro-ad/lib/index.js";

import { SellerPersonalCategoryAdvertisingSection } from "./SellerPersonalCategoryAdvertisingSection.jsx";
import { SiteHeaderBannerAdvertisingSection } from "./SiteHeaderBannerAdvertisingSection.jsx";

import "./AdvertisingPage.css";

/**
 * @param {string | null | undefined} status
 */
function resolveCampaignStatusLabel(status) {
  if (status === "pending") {
    return INTRO_AD_PAGE_UI.STATUS_PENDING;
  }
  if (status === "queued") {
    return INTRO_AD_PAGE_UI.STATUS_QUEUED;
  }
  if (status === "active") {
    return INTRO_AD_PAGE_UI.STATUS_ACTIVE;
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
  if (status === "pending" || status === "queued") {
    return "advertising-page__status advertising-page__status_pending";
  }
  return "advertising-page__status";
}

/**
 * @param {{
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 * }} props
 */
export function AdvertisingPage({ isAuthorized, onRequestLogin }) {
  const queryClient = useQueryClient();
  const campaignQuery = useMyIntroAdCampaignQuery({ enabled: isAuthorized });
  const loyaltyQuery = useMyLoyaltyPointsStatusQuery({ enabled: isAuthorized });
  const { previewIntro } = useAppIntro();

  const [form, setForm] = useState(() => mapAppIntroSettingsToForm(null));
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");

  const submitMutation = useMutation({
    mutationFn: submitIntroAdCampaign,
    onSuccess: async (result) => {
      if (result.loyaltyPointsBalance != null) {
        queryClient.setQueryData(loyaltyPointsQueryKeys.all, {
          loyaltyPointsBalance: result.loyaltyPointsBalance,
        });
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: introAdQueryKeys.myCampaign() }),
        queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all }),
      ]);
      setShowForm(false);
      setFeedback(INTRO_AD_PAGE_UI.SUBMIT_SUCCESS);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelIntroAdCampaign,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: introAdQueryKeys.myCampaign() }),
        queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all }),
      ]);
      setFeedback(INTRO_AD_PAGE_UI.CANCEL_SUCCESS);
    },
  });

  const campaign = campaignQuery.data?.campaign ?? null;
  const pricePoints = campaignQuery.data?.pricePoints ?? 30_000;
  const loyaltyBalance = loyaltyQuery.data?.loyaltyPointsBalance ?? 0;
  const canCancel =
    campaign?.status === "pending" || campaign?.status === "queued";
  const hasOpenCampaign = Boolean(campaign);
  const isSubmitting = submitMutation.isPending || cancelMutation.isPending;

  const updateField = (key, value) => {
    setActionError("");
    setFeedback("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePreview = () => {
    const validationError = validateAppIntroAdminForm(form);
    if (validationError) {
      setActionError(validationError);
      return;
    }
    if (!String(form.videoMp4Url ?? "").trim()) {
      setActionError("Загрузите MP4-ролик");
      return;
    }
    previewIntro(formToIntroAdPreviewSettings(buildSubmitIntroAdCampaignBody(form)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateAppIntroAdminForm(form);
    if (validationError) {
      setActionError(validationError);
      return;
    }
    if (!String(form.videoMp4Url ?? "").trim()) {
      setActionError("Загрузите MP4-ролик");
      return;
    }

    try {
      setActionError("");
      setFeedback("");
      await submitMutation.mutateAsync(buildSubmitIntroAdCampaignBody(form));
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : INTRO_AD_PAGE_UI.SUBMIT_FALLBACK,
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
        error instanceof Error ? error.message : INTRO_AD_PAGE_UI.CANCEL_FALLBACK,
      );
    }
  };

  if (!isAuthorized) {
    return (
      <section className="advertising-page">
        <header className="advertising-page__header">
          <h1 className="advertising-page__title">{ADVERTISING_PAGE_UI.PAGE_TITLE}</h1>
        </header>
        <p className="advertising-page__hint">{INTRO_AD_PAGE_UI.LOGIN_HINT}</p>
        <button
          type="button"
          className="advertising-page__login app-btn app-btn--primary"
          onClick={onRequestLogin}
        >
          {INTRO_AD_PAGE_UI.LOGIN_BUTTON}
        </button>
      </section>
    );
  }

  if (campaignQuery.isPending || loyaltyQuery.isPending) {
    return (
      <section className="advertising-page">
        <p className="advertising-page__state">{INTRO_AD_PAGE_UI.LOADING}</p>
      </section>
    );
  }

  if (campaignQuery.isError) {
    return (
      <section className="advertising-page">
        <p className="advertising-page__state advertising-page__state_error" role="alert">
          {campaignQuery.error instanceof Error
            ? campaignQuery.error.message
            : INTRO_AD_PAGE_UI.FETCH_FALLBACK}
        </p>
      </section>
    );
  }

  return (
    <section className="advertising-page" aria-label={INTRO_AD_PAGE_UI.PAGE_ARIA}>
      <header className="advertising-page__header">
        <h1 className="advertising-page__title">{ADVERTISING_PAGE_UI.PAGE_TITLE}</h1>
        <p className="advertising-page__page-lead">{ADVERTISING_PAGE_UI.PAGE_LEAD}</p>
      </header>

      <div className="advertising-page__balance-bar">
        <p className="advertising-page__balance-label">{ADVERTISING_PAGE_UI.BALANCE_LABEL}</p>
        <p className="advertising-page__balance-value">
          {ADVERTISING_PAGE_UI.BALANCE(loyaltyBalance)}
        </p>
      </div>

      <div className="advertising-page__cards">
        <article className="advertising-page__card advertising-page__card_intro">
          <div className="advertising-page__card-head">
            <h2 className="advertising-page__card-title">{INTRO_AD_PAGE_UI.CARD_TITLE}</h2>
            <span className="advertising-page__card-badge">3 дня</span>
          </div>

          <p className="advertising-page__lead">{INTRO_AD_PAGE_UI.DESCRIPTION}</p>

          <div className="advertising-page__meta">
            <div className="advertising-page__meta-item">
              <span className="advertising-page__meta-label">Стоимость</span>
              <span className="advertising-page__meta-value">{pricePoints} баллов</span>
            </div>
            <div className="advertising-page__meta-item">
              <span className="advertising-page__meta-label">Срок</span>
              <span className="advertising-page__meta-value">3 дня</span>
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
                  className="app-btn app-btn--secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  {INTRO_AD_PAGE_UI.CANCEL}
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
              {INTRO_AD_PAGE_UI.OPEN_FORM}
            </button>
          ) : null}

          {!hasOpenCampaign && showForm ? (
            <div className="advertising-page__panel">
              <p className="advertising-page__panel-title">Заявка на intro</p>
              <form className="advertising-page__form" onSubmit={handleSubmit}>
                <VideoUrlField
                  label="MP4"
                  value={form.videoMp4Url}
                  onChange={(value) => updateField("videoMp4Url", value)}
                />
                <VideoUrlField
                  label="WebM (необязательно)"
                  value={form.videoWebmUrl}
                  onChange={(value) => updateField("videoWebmUrl", value)}
                />
                <ImageUrlField
                  label="Poster"
                  value={form.posterUrl}
                  onChange={(value) => updateField("posterUrl", value)}
                />
                <label className="advertising-page__field">
                  Заголовок заглушки
                  <input
                    className="advertising-page__input"
                    value={form.fallbackTitle}
                    onChange={(event) => updateField("fallbackTitle", event.target.value)}
                  />
                </label>
                <label className="advertising-page__field">
                  Подсказка заглушки
                  <input
                    className="advertising-page__input"
                    value={form.fallbackHint}
                    onChange={(event) => updateField("fallbackHint", event.target.value)}
                  />
                </label>
                <fieldset className="advertising-page__timing">
                  <legend className="advertising-page__timing-legend">
                    {INTRO_AD_PAGE_UI.SECTION_TIMING}
                  </legend>
                  <p className="advertising-page__timing-hint">
                    {INTRO_AD_PAGE_UI.TIMING_HINT}
                  </p>
                  <div className="advertising-page__timing-grid">
                    <label className="advertising-page__field">
                      {INTRO_AD_PAGE_UI.LABEL_MIN_MS}
                      <input
                        className="advertising-page__input"
                        type="number"
                        min={500}
                        max={30000}
                        step={100}
                        value={form.minMs}
                        onChange={(event) => updateField("minMs", event.target.value)}
                      />
                    </label>
                    <label className="advertising-page__field">
                      {INTRO_AD_PAGE_UI.LABEL_MAX_MS}
                      <input
                        className="advertising-page__input"
                        type="number"
                        min={1000}
                        max={60000}
                        step={100}
                        value={form.maxMs}
                        onChange={(event) => updateField("maxMs", event.target.value)}
                      />
                    </label>
                    <label className="advertising-page__field">
                      {INTRO_AD_PAGE_UI.LABEL_FADE_MS}
                      <input
                        className="advertising-page__input"
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
                {actionError ? (
                  <p className="advertising-page__error" role="alert">
                    {actionError}
                  </p>
                ) : null}
                <div className="advertising-page__actions">
                  <button
                    type="button"
                    className="app-btn app-btn--secondary"
                    onClick={handlePreview}
                    disabled={isSubmitting}
                  >
                    {INTRO_AD_PAGE_UI.PREVIEW}
                  </button>
                  <button
                    type="submit"
                    className="app-btn app-btn--primary"
                    disabled={isSubmitting || loyaltyBalance < pricePoints}
                  >
                    {INTRO_AD_PAGE_UI.SUBMIT}
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

        <SellerPersonalCategoryAdvertisingSection
          isAuthorized={isAuthorized}
          loyaltyBalance={loyaltyBalance}
        />

        <SiteHeaderBannerAdvertisingSection
          isAuthorized={isAuthorized}
          loyaltyBalance={loyaltyBalance}
        />
      </div>
    </section>
  );
}
