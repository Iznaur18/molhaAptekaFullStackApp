import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { confirmEmailBind, requestEmailBind } from "../api/emailBind.js";
import { authMeQueryKeys } from "../model/authMeQueryKeys.js";
import { EDIT_PROFILE_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { keepDigitsOnly } from "../../../shared/lib/numericInput.js";

const CODE_LENGTH = 6;

/**
 * @param {{
 *   email: string;
 *   isEmailVerified: boolean;
 *   baselineEmail: string;
 *   disabled?: boolean;
 *   onVerified?: (email: string) => void;
 * }} props
 */
export function EmailBindControls({
  email,
  isEmailVerified,
  baselineEmail,
  disabled = false,
  onVerified,
}) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  const baseline = String(baselineEmail ?? "")
    .trim()
    .toLowerCase();
  const emailTrim = String(email ?? "")
    .trim()
    .toLowerCase();
  const needsVerify =
    Boolean(emailTrim) && (isEmailVerified !== true || emailTrim !== baseline);

  if (!needsVerify && isEmailVerified) {
    return (
      <span className="edit-profile-modal__hint">{EDIT_PROFILE_MODAL_UI.EMAIL_VERIFIED}</span>
    );
  }

  if (!emailTrim) {
    return null;
  }

  const isBusy = status.kind === "loading";

  const handleSend = async () => {
    setStatus({ kind: "loading", message: "" });
    try {
      await requestEmailBind({ email: emailTrim });
      setOtpSent(true);
      setStatus({ kind: "success", message: EDIT_PROFILE_MODAL_UI.EMAIL_SEND_CODE });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Ошибка отправки",
      });
    }
  };

  const handleConfirm = async () => {
    if (code.length !== CODE_LENGTH) {
      setStatus({ kind: "error", message: EDIT_PROFILE_MODAL_UI.EMAIL_CODE_LABEL });
      return;
    }
    setStatus({ kind: "loading", message: "" });
    try {
      const result = await confirmEmailBind({ code });
      setCode("");
      setOtpSent(false);
      setStatus({ kind: "success", message: EDIT_PROFILE_MODAL_UI.EMAIL_BIND_SUCCESS });
      await queryClient.invalidateQueries({ queryKey: authMeQueryKeys.all });
      onVerified?.(String(result?.email ?? emailTrim));
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Ошибка подтверждения",
      });
    }
  };

  return (
    <div className="edit-profile-modal__phone-bind">
      <span className="edit-profile-modal__hint edit-profile-modal__hint_unverified">
        {EDIT_PROFILE_MODAL_UI.EMAIL_NOT_VERIFIED}
      </span>
      {!otpSent ? (
        <button
          type="button"
          className="edit-profile-modal__secondary-btn"
          onClick={() => void handleSend()}
          disabled={disabled || isBusy}
        >
          {isBusy
            ? EDIT_PROFILE_MODAL_UI.EMAIL_SEND_CODE_LOADING
            : EDIT_PROFILE_MODAL_UI.EMAIL_SEND_CODE}
        </button>
      ) : (
        <>
          <input
            className="edit-profile-modal__input"
            type="text"
            value={code}
            onChange={(e) =>
              setCode(keepDigitsOnly(e.target.value).slice(0, CODE_LENGTH))
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            placeholder={EDIT_PROFILE_MODAL_UI.EMAIL_CODE_PLACEHOLDER}
            disabled={disabled || isBusy}
            aria-label={EDIT_PROFILE_MODAL_UI.EMAIL_CODE_LABEL}
          />
          <button
            type="button"
            className="edit-profile-modal__secondary-btn"
            onClick={() => void handleConfirm()}
            disabled={disabled || isBusy}
          >
            {isBusy
              ? EDIT_PROFILE_MODAL_UI.EMAIL_CONFIRM_LOADING
              : EDIT_PROFILE_MODAL_UI.EMAIL_CONFIRM_CODE}
          </button>
          <button
            type="button"
            className="edit-profile-modal__secondary-btn edit-profile-modal__secondary-btn--ghost"
            onClick={() => void handleSend()}
            disabled={disabled || isBusy}
          >
            {EDIT_PROFILE_MODAL_UI.EMAIL_SEND_CODE}
          </button>
        </>
      )}
      {status.kind === "error" ? (
        <span className="edit-profile-modal__hint edit-profile-modal__hint_error" role="alert">
          {status.message}
        </span>
      ) : null}
      {status.kind === "success" &&
      status.message === EDIT_PROFILE_MODAL_UI.EMAIL_BIND_SUCCESS ? (
        <span className="edit-profile-modal__hint">{status.message}</span>
      ) : null}
    </div>
  );
}
