import {
  CATEGORY_DEAL_TYPE_SERVICE,
  DEAL_REQUEST_COMMENT_MAX_LENGTH,
  ADDRESS_LINE_MAX_LENGTH,
  isCartDealType,
  isSellerPhoneOpenBeforeRequest,
  normalizeCategoryDealType,
} from "@molha/api-contract";
import { useId, useState } from "react";

import { PRODUCT_DEAL_ACTIONS_UI } from "../../../shared/config/appUiCopy.js";
import { HOME_MAIN_VIEW_PATH } from "../../../shared/lib/homeMainViewPaths.js";
import { fetchDealRequestSellerPhone } from "../api/dealRequestApi.js";
import {
  defaultDealRequestTime,
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from "../lib/dealRequestTime.js";
import { useCreateDealRequestMutation } from "../model/useDealRequestMutations.js";

import "./ProductDealActions.css";

/**
 * Что покупатель делает в объявлении без корзины: записывается на осмотр или
 * оставляет заявку на услугу, а у осмотра ещё и видит телефон продавца.
 *
 * @param {{
 *   product: { _id: unknown; productDealType?: unknown };
 *   isAuthorized: boolean;
 *   isOwnProduct: boolean;
 *   onRequestLogin: () => void;
 * }} props
 */
export function ProductDealActions({
  product,
  isAuthorized,
  isOwnProduct,
  onRequestLogin,
}) {
  const formId = useId();
  const dealType = normalizeCategoryDealType(product?.productDealType);
  const productId = String(product?._id ?? "");
  const createMutation = useCreateDealRequestMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [timeValue, setTimeValue] = useState(() =>
    toDateTimeLocalValue(defaultDealRequestTime()),
  );
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [phoneState, setPhoneState] = useState(
    /** @type {{ status: "idle" | "loading" | "ready" | "error"; phone?: string | null; message?: string }} */ ({
      status: "idle",
    }),
  );

  if (isCartDealType(dealType) || isOwnProduct || !productId) {
    return null;
  }

  const isService = dealType === CATEGORY_DEAL_TYPE_SERVICE;
  const canShowPhone = isSellerPhoneOpenBeforeRequest(dealType);

  const requireLogin = () => {
    if (isAuthorized) {
      return false;
    }
    onRequestLogin();
    return true;
  };

  const handleShowPhone = async () => {
    if (requireLogin()) {
      return;
    }
    setPhoneState({ status: "loading" });
    try {
      const phone = await fetchDealRequestSellerPhone(productId);
      setPhoneState({ status: "ready", phone });
    } catch (error) {
      setPhoneState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : PRODUCT_DEAL_ACTIONS_UI.PHONE_FALLBACK_ERROR,
      });
    }
  };

  const handleOpenForm = () => {
    if (requireLogin()) {
      return;
    }
    setFormError("");
    setIsFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const preferredAt = fromDateTimeLocalValue(timeValue);
    if (!preferredAt) {
      setFormError(PRODUCT_DEAL_ACTIONS_UI.TIME_REQUIRED);
      return;
    }
    setFormError("");
    try {
      await createMutation.mutateAsync({
        productId,
        preferredAt,
        comment: comment.trim(),
        ...(isService ? { address: address.trim() } : {}),
      });
      setIsFormOpen(false);
      setIsSent(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : PRODUCT_DEAL_ACTIONS_UI.SUBMIT_FALLBACK_ERROR,
      );
    }
  };

  if (isSent) {
    return (
      <div className="product-deal-actions" role="status">
        <p className="product-deal-actions__sent-title">
          {PRODUCT_DEAL_ACTIONS_UI.SENT_TITLE}
        </p>
        <p className="product-deal-actions__hint">
          {PRODUCT_DEAL_ACTIONS_UI.SENT_HINT}
        </p>
        <a
          className="app-btn app-btn--secondary product-deal-actions__button"
          href={HOME_MAIN_VIEW_PATH["deal-requests"]}
        >
          {PRODUCT_DEAL_ACTIONS_UI.OPEN_REQUESTS}
        </a>
      </div>
    );
  }

  return (
    <div className="product-deal-actions">
      {isFormOpen ? (
        <form
          className="product-deal-actions__form"
          onSubmit={handleSubmit}
          aria-labelledby={`${formId}-title`}
        >
          <p className="product-deal-actions__form-title" id={`${formId}-title`}>
            {PRODUCT_DEAL_ACTIONS_UI.FORM_TITLE[dealType]}
          </p>
          <label className="product-deal-actions__field">
            <span>{PRODUCT_DEAL_ACTIONS_UI.FIELD_TIME}</span>
            <input
              type="datetime-local"
              value={timeValue}
              min={toDateTimeLocalValue(new Date())}
              required
              onChange={(event) => setTimeValue(event.target.value)}
            />
          </label>
          {isService ? (
            <label className="product-deal-actions__field">
              <span>{PRODUCT_DEAL_ACTIONS_UI.FIELD_ADDRESS}</span>
              <input
                type="text"
                value={address}
                maxLength={ADDRESS_LINE_MAX_LENGTH}
                placeholder={PRODUCT_DEAL_ACTIONS_UI.FIELD_ADDRESS_PLACEHOLDER}
                onChange={(event) => setAddress(event.target.value)}
              />
            </label>
          ) : null}
          <label className="product-deal-actions__field">
            <span>{PRODUCT_DEAL_ACTIONS_UI.FIELD_COMMENT}</span>
            <textarea
              value={comment}
              rows={3}
              maxLength={DEAL_REQUEST_COMMENT_MAX_LENGTH}
              placeholder={PRODUCT_DEAL_ACTIONS_UI.FIELD_COMMENT_PLACEHOLDER[dealType]}
              onChange={(event) => setComment(event.target.value)}
            />
          </label>
          {formError ? (
            <p className="product-deal-actions__error" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="product-deal-actions__row">
            <button
              type="submit"
              className="app-btn app-btn--primary product-deal-actions__button"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending
                ? PRODUCT_DEAL_ACTIONS_UI.SUBMITTING
                : PRODUCT_DEAL_ACTIONS_UI.SUBMIT}
            </button>
            <button
              type="button"
              className="app-btn app-btn--cancel"
              disabled={createMutation.isPending}
              onClick={() => setIsFormOpen(false)}
            >
              {PRODUCT_DEAL_ACTIONS_UI.CANCEL}
            </button>
          </div>
        </form>
      ) : (
        <div className="product-deal-actions__row">
          <button
            type="button"
            className="app-btn app-btn--primary product-deal-actions__button"
            onClick={handleOpenForm}
          >
            {PRODUCT_DEAL_ACTIONS_UI.REQUEST_BUTTON[dealType]}
          </button>
          {canShowPhone && phoneState.status !== "ready" ? (
            <button
              type="button"
              className="app-btn app-btn--secondary product-deal-actions__button"
              disabled={phoneState.status === "loading"}
              onClick={() => void handleShowPhone()}
            >
              {phoneState.status === "loading"
                ? PRODUCT_DEAL_ACTIONS_UI.PHONE_LOADING
                : PRODUCT_DEAL_ACTIONS_UI.SHOW_PHONE}
            </button>
          ) : null}
          {phoneState.status === "ready" && phoneState.phone ? (
            <a
              className="app-btn app-btn--secondary product-deal-actions__button"
              href={`tel:${phoneState.phone}`}
              aria-label={PRODUCT_DEAL_ACTIONS_UI.PHONE_CALL_ARIA(phoneState.phone)}
            >
              {phoneState.phone}
            </a>
          ) : null}
        </div>
      )}
      {phoneState.status === "ready" && !phoneState.phone ? (
        <p className="product-deal-actions__hint">
          {PRODUCT_DEAL_ACTIONS_UI.PHONE_MISSING}
        </p>
      ) : null}
      {phoneState.status === "error" ? (
        <p className="product-deal-actions__error" role="alert">
          {phoneState.message}
        </p>
      ) : null}
      {!canShowPhone && !isFormOpen ? (
        <p className="product-deal-actions__hint">
          {PRODUCT_DEAL_ACTIONS_UI.SERVICE_PHONE_HINT}
        </p>
      ) : null}
    </div>
  );
}
