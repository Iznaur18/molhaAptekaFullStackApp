import { useState } from "react";

import { resendEmailVerification } from "../api/resendEmailVerification.js";
import { verifyEmailWithCode } from "../api/verifyEmailWithCode.js";
import { EMAIL_VERIFICATION_UI } from "../../../shared/config/appUiCopy.js";
import { keepDigitsOnly } from "../../../shared/lib/numericInput.js";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";

import "./EmailVerificationModal.css";

const EMAIL_VERIFICATION_MODAL_TITLE_ID = "email-verification-modal-title";
const EMAIL_VERIFICATION_CODE_LENGTH = 6;

/**
 * @param {{
 *   isOpen: boolean;
 *   email: string;
 *   onClose: () => void;
 *   onVerified?: () => void;
 * }} props
 */
export function EmailVerificationModal({ isOpen, email, onClose, onVerified }) {
  const [code, setCode] = useState("");
  const [submitStatus, setSubmitStatus] = useState({ kind: "idle", message: "" });
  const [resendStatus, setResendStatus] = useState({ kind: "idle", message: "" });

  const isSubmitting = submitStatus.kind === "loading";
  const isResending = resendStatus.kind === "loading";
  const isBusy = isSubmitting || isResending;

  const handleCodeChange = (event) => {
    const nextCode = keepDigitsOnly(event.target.value).slice(0, EMAIL_VERIFICATION_CODE_LENGTH);
    setCode(nextCode);
    if (submitStatus.message) {
      setSubmitStatus({ kind: "idle", message: "" });
    }
  };

  const handleConfirm = async (event) => {
    event.preventDefault();

    if (code.length !== EMAIL_VERIFICATION_CODE_LENGTH) {
      setSubmitStatus({
        kind: "error",
        message: EMAIL_VERIFICATION_UI.CODE_REQUIRED,
      });
      return;
    }

    setSubmitStatus({ kind: "loading", message: "" });

    try {
      await verifyEmailWithCode(code);
      setCode("");
      setSubmitStatus({ kind: "idle", message: "" });
      setResendStatus({ kind: "idle", message: "" });
      onVerified?.();
    } catch (error) {
      setSubmitStatus({
        kind: "error",
        message:
          error instanceof Error ? error.message : EMAIL_VERIFICATION_UI.CONFIRM_ERROR,
      });
    }
  };

  const handleResend = async () => {
    setResendStatus({ kind: "loading", message: "" });
    try {
      const message = await resendEmailVerification();
      setCode("");
      setSubmitStatus({ kind: "idle", message: "" });
      setResendStatus({
        kind: "success",
        message: message || EMAIL_VERIFICATION_UI.RESENT,
      });
    } catch (error) {
      setResendStatus({
        kind: "error",
        message:
          error instanceof Error ? error.message : EMAIL_VERIFICATION_UI.RESEND_ERROR,
      });
    }
  };

  const handleClose = () => {
    setCode("");
    setSubmitStatus({ kind: "idle", message: "" });
    setResendStatus({ kind: "idle", message: "" });
    onClose();
  };

  const displayEmail =
    String(email ?? "").trim() || EMAIL_VERIFICATION_UI.MODAL_EMAIL_FALLBACK;

  const feedbackMessage = submitStatus.message || resendStatus.message;
  const feedbackKind = submitStatus.message ? submitStatus.kind : resendStatus.kind;

  return (
    <ProductModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={EMAIL_VERIFICATION_UI.MODAL_TITLE}
      titleId={EMAIL_VERIFICATION_MODAL_TITLE_ID}
      ariaLabel={EMAIL_VERIFICATION_UI.MODAL_ARIA}
      size="md"
      bodyClassName="email-verification-modal__body"
    >
      <form className="email-verification-modal__content" onSubmit={handleConfirm}>
        <p className="email-verification-modal__text">
          {EMAIL_VERIFICATION_UI.MODAL_TEXT(displayEmail)}
        </p>
        <label className="email-verification-modal__label">
          {EMAIL_VERIFICATION_UI.LABEL_CODE}
          <input
            className="email-verification-modal__input"
            type="text"
            name="verificationCode"
            value={code}
            onChange={handleCodeChange}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={EMAIL_VERIFICATION_CODE_LENGTH}
            placeholder={EMAIL_VERIFICATION_UI.CODE_PLACEHOLDER}
            disabled={isBusy}
            aria-required="true"
          />
        </label>
        {feedbackMessage ? (
          <p
            className={`email-verification-modal__message email-verification-modal__message_${feedbackKind}`}
            role={feedbackKind === "error" ? "alert" : "status"}
          >
            {feedbackMessage}
          </p>
        ) : null}
        <div className="email-verification-modal__actions">
          <button
            type="submit"
            className="email-verification-modal__confirm"
            disabled={isBusy}
          >
            {isSubmitting
              ? EMAIL_VERIFICATION_UI.CONFIRM_LOADING
              : EMAIL_VERIFICATION_UI.CONFIRM_BUTTON}
          </button>
          <button
            type="button"
            className="email-verification-modal__resend"
            onClick={() => void handleResend()}
            disabled={isBusy}
          >
            {isResending
              ? EMAIL_VERIFICATION_UI.RESEND_LOADING
              : EMAIL_VERIFICATION_UI.RESEND_BUTTON}
          </button>
          <button
            type="button"
            className="email-verification-modal__close"
            onClick={handleClose}
            disabled={isBusy}
          >
            {EMAIL_VERIFICATION_UI.MODAL_CLOSE}
          </button>
        </div>
      </form>
    </ProductModalShell>
  );
}
