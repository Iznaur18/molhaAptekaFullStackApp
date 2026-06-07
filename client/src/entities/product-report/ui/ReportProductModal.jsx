import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useSubmitProductReportMutation } from "../model/useSubmitProductReportMutation.js";
import { PRODUCT_REPORT_TEXT_MAX_CHARS } from "../model/constants.js";
import { PRODUCT_REPORT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";

import "./ReportProductModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   productId: string | null;
 *   productName?: string;
 *   hasPendingReport?: boolean;
 *   onClose: () => void;
 *   onSubmitted: () => void;
 * }} props
 */
export function ReportProductModal({
  isOpen,
  productId,
  productName = "",
  hasPendingReport = false,
  onClose,
  onSubmitted,
}) {
  const submitReportMutation = useSubmitProductReportMutation();
  const [reportText, setReportText] = useState("");
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReportText("");
      setPhase("idle");
      setError("");
    }
  }, [isOpen]);

  useScrollLock(isOpen);

  const charCount = reportText.length;
  const isOverLimit = charCount > PRODUCT_REPORT_TEXT_MAX_CHARS;
  const isSubmitting = phase === "loading";
  const isBlocked = hasPendingReport || !productId;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!productId || isBlocked || isOverLimit) return;

    setPhase("loading");
    setError("");
    try {
      await submitReportMutation.mutateAsync({
        productId,
        reportText: reportText.trim(),
      });
      onSubmitted();
      onClose();
    } catch (e) {
      setPhase("idle");
      setError(e instanceof Error ? e.message : PRODUCT_REPORT_MODAL_UI.SUBMIT);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="report-product-modal"
      role="dialog"
      aria-modal="true"
      aria-label={PRODUCT_REPORT_MODAL_UI.ARIA_DIALOG}
    >
      <div className="report-product-modal__backdrop" aria-hidden="true" />
      <div className="report-product-modal__card">
        <div className="report-product-modal__header">
          <h2 className="report-product-modal__title">
            {PRODUCT_REPORT_MODAL_UI.TITLE}
          </h2>
          <button
            type="button"
            className="report-product-modal__close"
            onClick={onClose}
            aria-label={PRODUCT_REPORT_MODAL_UI.CANCEL}
          >
            <ModalCloseIcon />
          </button>
        </div>
        {productName ? (
          <p className="report-product-modal__product-name">{productName}</p>
        ) : null}
        {hasPendingReport ? (
          <p className="report-product-modal__already" role="status">
            {PRODUCT_REPORT_MODAL_UI.ALREADY_REPORTED}
          </p>
        ) : (
          <form className="report-product-modal__form" onSubmit={handleSubmit}>
            <label className="report-product-modal__label">
              {PRODUCT_REPORT_MODAL_UI.LABEL_TEXT}
              <textarea
                className="report-product-modal__textarea"
                value={reportText}
                onChange={(event) => setReportText(event.target.value)}
                placeholder={PRODUCT_REPORT_MODAL_UI.PLACEHOLDER}
                rows={4}
                disabled={isSubmitting}
              />
              <span
                className={
                  isOverLimit
                    ? "report-product-modal__meter report-product-modal__meter_overflow"
                    : "report-product-modal__meter"
                }
              >
                {PRODUCT_REPORT_MODAL_UI.CHARS_USED(
                  charCount,
                  PRODUCT_REPORT_TEXT_MAX_CHARS,
                )}
              </span>
            </label>
            {error ? (
              <p className="report-product-modal__error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="report-product-modal__actions">
              <button
                type="button"
                className="report-product-modal__cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {PRODUCT_REPORT_MODAL_UI.CANCEL}
              </button>
              <button
                type="submit"
                className="report-product-modal__submit"
                disabled={isSubmitting || reportText.trim().length === 0 || isOverLimit}
              >
                {isSubmitting
                  ? PRODUCT_REPORT_MODAL_UI.SUBMIT_LOADING
                  : PRODUCT_REPORT_MODAL_UI.SUBMIT}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
