import {
  ADDRESS_LINE_MAX_LENGTH,
  CATEGORY_DEAL_TYPE_SERVICE,
  DEAL_REQUEST_COMMENT_MAX_LENGTH,
} from "@molha/api-contract";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { PRODUCT_DEAL_ACTIONS_UI } from "../../../shared/config/appUiCopy.js";
import { HOME_MAIN_VIEW_PATH } from "../../../shared/lib/homeMainViewPaths.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useEnterExitMountAnimation } from "../../../shared/lib/useEnterExitMountAnimation.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import {
  defaultDealRequestTime,
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from "../lib/dealRequestTime.js";
import { useCreateDealRequestMutation } from "../model/useDealRequestMutations.js";

import "./DealRequestSheet.css";

const SHEET_EXIT_MS = 220;

/**
 * Окно заявки на осмотр или услугу: выезжает снизу, как остальные листы
 * сайта. После отправки показывает итог прямо в окне — покупатель видит, что
 * заявка ушла, и не жмёт кнопку второй раз.
 *
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   productId: string;
 *   dealType: "viewing" | "service";
 * }} props
 */
export function DealRequestSheet({ isOpen, onClose, productId, dealType }) {
  const titleId = useId();
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  // Фокус — на заголовок, а не в поле: иначе браузер сразу выделяет день в
  // дате, и окно открывается с непонятной синей подсветкой.
  const titleRef = useRef(/** @type {HTMLHeadingElement | null} */ (null));
  const { mounted, isVisible } = useEnterExitMountAnimation(isOpen, {
    exitMs: SHEET_EXIT_MS,
  });
  const createMutation = useCreateDealRequestMutation();

  const [initialWhen] = useState(() => toDateTimeLocalValue(defaultDealRequestTime()));
  const [dateValue, setDateValue] = useState(() => initialWhen.slice(0, 10));
  const [clockValue, setClockValue] = useState(() => initialWhen.slice(11, 16));
  const todayValue = toDateTimeLocalValue(new Date()).slice(0, 10);
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const isService = dealType === CATEGORY_DEAL_TYPE_SERVICE;

  useScrollLock(mounted);
  useDialogFocusTrap(panelRef, {
    active: isOpen && isVisible,
    initialFocusRef: titleRef,
  });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    /** @param {KeyboardEvent} event */
    const onKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }
      const topLayer = getTopModalFocusLayer();
      if (!topLayer || topLayer.container !== panelRef.current) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const preferredAt =
      dateValue && clockValue
        ? fromDateTimeLocalValue(`${dateValue}T${clockValue}`)
        : null;
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
      setIsSent(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : PRODUCT_DEAL_ACTIONS_UI.SUBMIT_FALLBACK_ERROR,
      );
    }
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={[
        "deal-request-sheet__backdrop",
        isVisible ? "deal-request-sheet__backdrop--open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="deal-request-sheet__scrim" aria-hidden="true" />
      <button
        type="button"
        className="deal-request-sheet__dismiss"
        aria-label={PRODUCT_DEAL_ACTIONS_UI.CANCEL}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="deal-request-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <span className="deal-request-sheet__grabber" aria-hidden="true" />
        {isSent ? (
          <div className="deal-request-sheet__body" role="status">
            <h2 id={titleId} className="deal-request-sheet__title">
              {PRODUCT_DEAL_ACTIONS_UI.SENT_TITLE}
            </h2>
            <p className="deal-request-sheet__hint">
              {PRODUCT_DEAL_ACTIONS_UI.SENT_HINT}
            </p>
            <div className="deal-request-sheet__actions">
              <a
                className="app-btn app-btn--primary deal-request-sheet__button"
                href={HOME_MAIN_VIEW_PATH["deal-requests"]}
              >
                {PRODUCT_DEAL_ACTIONS_UI.OPEN_REQUESTS}
              </a>
              <button
                type="button"
                className="app-btn app-btn--secondary deal-request-sheet__button"
                onClick={onClose}
              >
                {PRODUCT_DEAL_ACTIONS_UI.CLOSE}
              </button>
            </div>
          </div>
        ) : (
          <form className="deal-request-sheet__body" onSubmit={handleSubmit}>
            <h2
              id={titleId}
              ref={titleRef}
              tabIndex={-1}
              className="deal-request-sheet__title"
            >
              {PRODUCT_DEAL_ACTIONS_UI.FORM_TITLE[dealType]}
            </h2>
            {/* Дата и время — двумя полями: одно общее на телефоне читалось
                плохо и при открытии подсвечивало день. */}
            <div className="deal-request-sheet__when">
              <label className="deal-request-sheet__field">
                <span>{PRODUCT_DEAL_ACTIONS_UI.FIELD_DATE}</span>
                <input
                  type="date"
                  value={dateValue}
                  min={todayValue}
                  required
                  onChange={(event) => setDateValue(event.target.value)}
                />
              </label>
              <label className="deal-request-sheet__field">
                <span>{PRODUCT_DEAL_ACTIONS_UI.FIELD_CLOCK}</span>
                <input
                  type="time"
                  value={clockValue}
                  step={900}
                  required
                  onChange={(event) => setClockValue(event.target.value)}
                />
              </label>
            </div>
            {isService ? (
              <label className="deal-request-sheet__field">
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
            <label className="deal-request-sheet__field">
              <span>{PRODUCT_DEAL_ACTIONS_UI.FIELD_COMMENT}</span>
              <textarea
                value={comment}
                rows={3}
                maxLength={DEAL_REQUEST_COMMENT_MAX_LENGTH}
                placeholder={
                  PRODUCT_DEAL_ACTIONS_UI.FIELD_COMMENT_PLACEHOLDER[dealType]
                }
                onChange={(event) => setComment(event.target.value)}
              />
            </label>
            {formError ? (
              <p className="deal-request-sheet__error" role="alert">
                {formError}
              </p>
            ) : null}
            {/* «Отмена» слева, главное действие справа — под большим пальцем. */}
            <div className="deal-request-sheet__actions">
              <button
                type="button"
                className="app-btn app-btn--secondary deal-request-sheet__button"
                disabled={createMutation.isPending}
                onClick={onClose}
              >
                {PRODUCT_DEAL_ACTIONS_UI.CANCEL}
              </button>
              <button
                type="submit"
                className="app-btn app-btn--primary deal-request-sheet__button"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending
                  ? PRODUCT_DEAL_ACTIONS_UI.SUBMITTING
                  : PRODUCT_DEAL_ACTIONS_UI.SUBMIT_BY_KIND[dealType]}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
