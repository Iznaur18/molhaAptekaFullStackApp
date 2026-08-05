import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  confirmPhoneBind,
  requestPhoneBind,
} from "../api/registerUserByPhone.js";
import { maskRuPhoneInput } from "../lib/ruPhone.js";
import { authMeQueryKeys } from "../model/authMeQueryKeys.js";
import { EDIT_PROFILE_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { keepDigitsOnly } from "../../../shared/lib/numericInput.js";

const CODE_LENGTH = 6;

/**
 * @param {{
 *   phoneNumber: string;
 *   isPhoneVerified: boolean;
 *   baselinePhone: string;
 *   disabled?: boolean;
 *   onVerified?: () => void;
 * }} props
 */
export function PhoneBindControls({
  phoneNumber,
  isPhoneVerified,
  baselinePhone,
  disabled = false,
  onVerified,
}) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  const maskedBaseline = maskRuPhoneInput(baselinePhone ?? "");
  const phoneTrim = String(phoneNumber ?? "").trim();
  const needsVerify =
    Boolean(phoneTrim) &&
    (isPhoneVerified !== true || phoneTrim !== maskedBaseline);

  if (!needsVerify && isPhoneVerified) {
    return (
      <span className="edit-profile-modal__hint">{EDIT_PROFILE_MODAL_UI.PHONE_VERIFIED}</span>
    );
  }

  if (!phoneTrim) {
    return null;
  }

  const isBusy = status.kind === "loading";

  const handleSend = async () => {
    setStatus({ kind: "loading", message: "" });
    try {
      await requestPhoneBind({ phoneNumber: phoneTrim });
      setOtpSent(true);
      setStatus({ kind: "success", message: EDIT_PROFILE_MODAL_UI.PHONE_SEND_CODE });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Ошибка SMS",
      });
    }
  };

  const handleConfirm = async () => {
    if (code.length !== CODE_LENGTH) {
      setStatus({ kind: "error", message: EDIT_PROFILE_MODAL_UI.PHONE_CODE_LABEL });
      return;
    }
    setStatus({ kind: "loading", message: "" });
    try {
      await confirmPhoneBind({ code });
      setCode("");
      setOtpSent(false);
      setStatus({ kind: "success", message: EDIT_PROFILE_MODAL_UI.PHONE_BIND_SUCCESS });
      await queryClient.invalidateQueries({ queryKey: authMeQueryKeys.all });
      onVerified?.();
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Ошибка подтверждения",
      });
    }
  };

  return (
    <div className="edit-profile-modal__phone-bind">
      <span className="edit-profile-modal__hint">
        {EDIT_PROFILE_MODAL_UI.PHONE_NOT_VERIFIED}
      </span>
      <button
        type="button"
        className="edit-profile-modal__secondary-btn"
        onClick={() => void handleSend()}
        disabled={disabled || isBusy}
      >
        {isBusy && !otpSent
          ? EDIT_PROFILE_MODAL_UI.PHONE_SEND_CODE_LOADING
          : EDIT_PROFILE_MODAL_UI.PHONE_SEND_CODE}
      </button>
      {otpSent ? (
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
            placeholder={EDIT_PROFILE_MODAL_UI.PHONE_CODE_PLACEHOLDER}
            disabled={disabled || isBusy}
            aria-label={EDIT_PROFILE_MODAL_UI.PHONE_CODE_LABEL}
          />
          <button
            type="button"
            className="edit-profile-modal__secondary-btn"
            onClick={() => void handleConfirm()}
            disabled={disabled || isBusy}
          >
            {isBusy
              ? EDIT_PROFILE_MODAL_UI.PHONE_CONFIRM_LOADING
              : EDIT_PROFILE_MODAL_UI.PHONE_CONFIRM_CODE}
          </button>
        </>
      ) : null}
      {status.kind === "error" ? (
        <span className="edit-profile-modal__hint" role="alert">
          {status.message}
        </span>
      ) : null}
      {status.kind === "success" && status.message === EDIT_PROFILE_MODAL_UI.PHONE_BIND_SUCCESS ? (
        <span className="edit-profile-modal__hint">{status.message}</span>
      ) : null}
    </div>
  );
}
