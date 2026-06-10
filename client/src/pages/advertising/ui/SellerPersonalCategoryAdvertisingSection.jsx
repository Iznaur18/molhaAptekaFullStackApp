import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  cancelSellerPersonalCategoryCampaign,
  submitSellerPersonalCategoryCampaign,
} from "../../../entities/seller-personal-category/api/sellerPersonalCategoryApi.js";
import { useMySellerPersonalCategoryCampaignQuery } from "../../../entities/seller-personal-category/model/useMySellerPersonalCategoryCampaignQuery.js";
import { sellerPersonalCategoryQueryKeys } from "../../../entities/seller-personal-category/model/sellerPersonalCategoryQueryKeys.js";
import { loyaltyPointsQueryKeys } from "../../../entities/user/model/loyaltyPointsQueryKeys.js";
import { SELLER_PERSONAL_CATEGORY_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";

/**
 * @param {string | null | undefined} status
 */
function resolveCampaignStatusLabel(status) {
  if (status === "pending") {
    return SELLER_PERSONAL_CATEGORY_PAGE_UI.STATUS_PENDING;
  }
  if (status === "active") {
    return SELLER_PERSONAL_CATEGORY_PAGE_UI.STATUS_ACTIVE;
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
export function SellerPersonalCategoryAdvertisingSection({
  isAuthorized,
  loyaltyBalance,
}) {
  const queryClient = useQueryClient();
  const campaignQuery = useMySellerPersonalCategoryCampaignQuery({
    enabled: isAuthorized,
  });

  const [labelRu, setLabelRu] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tariffCode, setTariffCode] = useState("7d");
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");

  const durations = campaignQuery.data?.durations ?? [];
  const selectedDuration = useMemo(
    () => durations.find((item) => item.code === tariffCode) ?? durations[0] ?? null,
    [durations, tariffCode],
  );
  const pricePoints = selectedDuration?.pricePoints ?? 0;

  const submitMutation = useMutation({
    mutationFn: submitSellerPersonalCategoryCampaign,
    onSuccess: async (result) => {
      if (result.loyaltyPointsBalance != null) {
        queryClient.setQueryData(loyaltyPointsQueryKeys.all, {
          loyaltyPointsBalance: result.loyaltyPointsBalance,
        });
      }
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: sellerPersonalCategoryQueryKeys.myCampaign(),
        }),
        queryClient.invalidateQueries({
          queryKey: sellerPersonalCategoryQueryKeys.catalogTiles(),
        }),
        queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all }),
      ]);
      setShowForm(false);
      setFeedback(SELLER_PERSONAL_CATEGORY_PAGE_UI.SUBMIT_SUCCESS);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSellerPersonalCategoryCampaign,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: sellerPersonalCategoryQueryKeys.myCampaign(),
        }),
        queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all }),
      ]);
      setFeedback(SELLER_PERSONAL_CATEGORY_PAGE_UI.CANCEL_SUCCESS);
    },
  });

  const campaign = campaignQuery.data?.campaign ?? null;
  const canCancel = campaign?.status === "pending";
  const isActiveCampaign = campaign?.status === "active";
  const hasOpenCampaign = Boolean(campaign);
  const isSubmitting = submitMutation.isPending || cancelMutation.isPending;
  const showTariffQuote = !hasOpenCampaign || showForm;

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setActionError("");
      setFeedback("");
      await submitMutation.mutateAsync({
        labelRu: labelRu.trim(),
        imageUrl: imageUrl.trim(),
        tariffCode,
      });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : SELLER_PERSONAL_CATEGORY_PAGE_UI.SUBMIT_FALLBACK,
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
          : SELLER_PERSONAL_CATEGORY_PAGE_UI.CANCEL_FALLBACK,
      );
    }
  };

  if (!isAuthorized) {
    return null;
  }

  if (campaignQuery.isPending) {
    return (
      <article className="advertising-page__card advertising-page__card_category">
        <h2 className="advertising-page__card-title">
          {SELLER_PERSONAL_CATEGORY_PAGE_UI.SECTION_TITLE}
        </h2>
        <p className="advertising-page__state">{SELLER_PERSONAL_CATEGORY_PAGE_UI.LOADING}</p>
      </article>
    );
  }

  if (campaignQuery.isError) {
    return (
      <article className="advertising-page__card advertising-page__card_category">
        <h2 className="advertising-page__card-title">
          {SELLER_PERSONAL_CATEGORY_PAGE_UI.SECTION_TITLE}
        </h2>
        <p className="advertising-page__state_error" role="alert">
          {campaignQuery.error instanceof Error
            ? campaignQuery.error.message
            : SELLER_PERSONAL_CATEGORY_PAGE_UI.FETCH_FALLBACK}
        </p>
      </article>
    );
  }

  return (
    <article className="advertising-page__card advertising-page__card_category">
      <div className="advertising-page__card-head">
        <h2 className="advertising-page__card-title">
          {SELLER_PERSONAL_CATEGORY_PAGE_UI.SECTION_TITLE}
        </h2>
        {selectedDuration ? (
          <span className="advertising-page__card-badge">{selectedDuration.title}</span>
        ) : null}
      </div>

      <p className="advertising-page__lead">{SELLER_PERSONAL_CATEGORY_PAGE_UI.SECTION_LEAD}</p>

      {showTariffQuote && selectedDuration ? (
        <div className="advertising-page__meta">
          <div className="advertising-page__meta-item">
            <span className="advertising-page__meta-label">Стоимость</span>
            <span className="advertising-page__meta-value">{pricePoints} баллов</span>
          </div>
          <div className="advertising-page__meta-item">
            <span className="advertising-page__meta-label">Срок</span>
            <span className="advertising-page__meta-value">{selectedDuration.title}</span>
          </div>
        </div>
      ) : null}

      {campaign ? (
        <div className={resolveStatusPanelClass(campaign.status)}>
          <p className="advertising-page__status-text">
            {resolveCampaignStatusLabel(campaign.status)}
          </p>
          {isActiveCampaign ? (
            <p className="advertising-page__status-text">
              {SELLER_PERSONAL_CATEGORY_PAGE_UI.STATUS_ACTIVE_UNTIL(campaign.activeUntil)}
            </p>
          ) : null}
          {canCancel ? (
            <button
              type="button"
              className="app-btn app-btn--secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {SELLER_PERSONAL_CATEGORY_PAGE_UI.CANCEL}
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
          {SELLER_PERSONAL_CATEGORY_PAGE_UI.OPEN_FORM}
        </button>
      ) : null}

      {!hasOpenCampaign && showForm ? (
        <div className="advertising-page__panel">
          <p className="advertising-page__panel-title">Заявка на личную категорию</p>
          <form className="advertising-page__form" onSubmit={handleSubmit}>
            <label className="advertising-page__field">
              {SELLER_PERSONAL_CATEGORY_PAGE_UI.LABEL_NAME}
              <input
                className="advertising-page__input"
                value={labelRu}
                maxLength={80}
                onChange={(event) => setLabelRu(event.target.value)}
              />
            </label>
            <ImageUrlField
              label={SELLER_PERSONAL_CATEGORY_PAGE_UI.LABEL_IMAGE}
              value={imageUrl}
              onChange={setImageUrl}
            />
            <fieldset className="advertising-page__field">
              <legend>{SELLER_PERSONAL_CATEGORY_PAGE_UI.LABEL_DURATION}</legend>
              <div className="advertising-page__tariffs">
                {durations.map((item) => (
                  <label key={item.code} className="advertising-page__tariff">
                    <input
                      type="radio"
                      name="seller-personal-category-tariff"
                      value={item.code}
                      checked={tariffCode === item.code}
                      onChange={() => setTariffCode(item.code)}
                    />
                    <span className="advertising-page__tariff-title">{item.title}</span>
                    <span className="advertising-page__tariff-price">
                      {item.pricePoints} баллов
                    </span>
                  </label>
                ))}
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
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="app-btn app-btn--primary"
                disabled={isSubmitting || loyaltyBalance < pricePoints}
              >
                {SELLER_PERSONAL_CATEGORY_PAGE_UI.SUBMIT}
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
