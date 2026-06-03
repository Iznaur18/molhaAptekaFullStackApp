import { useState } from "react";

import { resendEmailVerification } from "../api/resendEmailVerification.js";
import { EMAIL_VERIFICATION_UI } from "../../../shared/config/appUiCopy.js";

import "./EmailVerificationBanner.css";

/**
 * @param {{ onVerified?: () => void }} props
 */
export function EmailVerificationBanner() {
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  const handleResend = async () => {
    setStatus({ kind: "loading", message: "" });
    try {
      const message = await resendEmailVerification();
      setStatus({
        kind: "success",
        message: message || EMAIL_VERIFICATION_UI.RESENT,
      });
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : EMAIL_VERIFICATION_UI.RESEND_ERROR,
      });
    }
  };

  return (
    <div className="email-verification-banner" role="status">
      <p className="email-verification-banner__text">
        {EMAIL_VERIFICATION_UI.BANNER_TEXT}
      </p>
      <button
        type="button"
        className="email-verification-banner__button"
        onClick={() => void handleResend()}
        disabled={status.kind === "loading"}
      >
        {status.kind === "loading"
          ? EMAIL_VERIFICATION_UI.RESEND_LOADING
          : EMAIL_VERIFICATION_UI.RESEND_BUTTON}
      </button>
      {status.message ? (
        <p
          className={`email-verification-banner__message email-verification-banner__message_${status.kind}`}
        >
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
