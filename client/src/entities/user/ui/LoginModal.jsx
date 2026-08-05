import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { LOGIN_MODAL_UI, AUTH_UI } from "../../../shared/config/appUiCopy.js";
import { AUTH_FORGOT_PASSWORD_PATH } from "../../../shared/lib/authPaths.js";
import { isAuthSessionError } from "../../../shared/lib/isAuthSessionError.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";
import { PasswordInputField } from "../../../shared/ui/PasswordInputField/PasswordInputField.jsx";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { loginUserByPhonePassword } from "../api/phoneAuth.js";
import {
  assertAuthenticatedProfile,
  fetchCurrentUserProfile,
} from "../api/fetchCurrentUserProfile.js";
import { loginUser } from "../api/loginUser.js";
import { hydrateAuthMeCache } from "../lib/authMeQueryCache.js";
import { maskRuPhoneInput } from "../lib/ruPhone.js";
import { resetAuthSessionState } from "../../../shared/api/apiClient.js";

import "./LoginModal.css";

const LOGIN_MODAL_TITLE_ID = "login-modal-title";

/**
 * @param {{
 * isOpen: boolean;
 * onClose: () => void;
 * onSuccess?: () => void;
 * onRegisterClick?: () => void;
 * }} props
 */
export function LoginModal({ isOpen, onClose, onSuccess, onRegisterClick }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [channel, setChannel] = useState(/** @type {"email" | "phone"} */ ("email"));
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const loginMutation = useMutation({
    onMutate: async () => {
      resetAuthSessionState();
      await queryClient.cancelQueries();
    },
    mutationFn: async () => {
      if (channel === "email") {
        await loginUser({ email, password });
      } else {
        await loginUserByPhonePassword({ phoneNumber, password });
      }
      return assertAuthenticatedProfile(await fetchCurrentUserProfile());
    },
    onSuccess: (data) => {
      hydrateAuthMeCache(queryClient, data);
    },
  });

  const isLoading = loginMutation.isPending;

  const statusMessage =
    localError ||
    (loginMutation.isError
      ? loginMutation.error instanceof Error && isAuthSessionError(loginMutation.error)
        ? LOGIN_MODAL_UI.SESSION_VERIFY_FALLBACK
        : loginMutation.error instanceof Error
          ? loginMutation.error.message
          : LOGIN_MODAL_UI.ERROR_GENERIC
      : "");

  const successMessage = loginMutation.isSuccess ? LOGIN_MODAL_UI.SUCCESS : "";

  const resetForm = () => {
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setLocalError("");
    loginMutation.reset();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    if (channel === "phone" && !String(phoneNumber).trim()) {
      setLocalError(LOGIN_MODAL_UI.ERROR_PHONE_REQUIRED);
      return;
    }

    try {
      await loginMutation.mutateAsync();
      resetForm();
      onSuccess?.();
    } catch {
      // mutation state
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleRegisterClick = () => {
    resetForm();
    onRegisterClick?.();
  };

  return (
    <ProductModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={LOGIN_MODAL_UI.TITLE}
      titleId={LOGIN_MODAL_TITLE_ID}
      ariaLabel={LOGIN_MODAL_UI.ARIA_DIALOG}
      size="md"
      bodyClassName="login-modal__body"
    >
      <form className="login-modal__form" onSubmit={handleSubmit}>
        <div className="login-modal__channel" role="group" aria-label="Способ входа">
          <button
            type="button"
            className={
              channel === "email"
                ? "login-modal__channel-btn login-modal__channel-btn--active"
                : "login-modal__channel-btn"
            }
            onClick={() => {
              setChannel("email");
              setLocalError("");
            }}
            disabled={isLoading}
          >
            {LOGIN_MODAL_UI.CHANNEL_EMAIL}
          </button>
          <button
            type="button"
            className={
              channel === "phone"
                ? "login-modal__channel-btn login-modal__channel-btn--active"
                : "login-modal__channel-btn"
            }
            onClick={() => {
              setChannel("phone");
              setLocalError("");
            }}
            disabled={isLoading}
          >
            {LOGIN_MODAL_UI.CHANNEL_PHONE}
          </button>
        </div>

        {channel === "email" ? (
          <label className="login-modal__label">
            <FormFieldLabel required>{LOGIN_MODAL_UI.LABEL_EMAIL}</FormFieldLabel>
            <input
              className="login-modal__input"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
        ) : (
          <label className="login-modal__label">
            <FormFieldLabel required>{LOGIN_MODAL_UI.LABEL_PHONE}</FormFieldLabel>
            <input
              className="login-modal__input"
              type="tel"
              name="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(maskRuPhoneInput(e.target.value))}
              required
              autoComplete="tel"
              placeholder="8 (912) 345-67-89"
            />
          </label>
        )}

        <label className="login-modal__label">
          <FormFieldLabel required>{LOGIN_MODAL_UI.LABEL_PASSWORD}</FormFieldLabel>
          <PasswordInputField
            className="login-modal__input"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={LOGIN_MODAL_UI.PASSWORD_MIN_LENGTH}
            autoComplete="current-password"
            showPasswordAria={LOGIN_MODAL_UI.SHOW_PASSWORD_ARIA}
            hidePasswordAria={LOGIN_MODAL_UI.HIDE_PASSWORD_ARIA}
          />
        </label>

        {statusMessage ? (
          <p className="login-modal__message login-modal__message_error" role="alert">
            {statusMessage}
          </p>
        ) : null}
        {successMessage ? (
          <p className="login-modal__message login-modal__message_success">{successMessage}</p>
        ) : null}

        <button type="submit" className="login-modal__submit" disabled={isLoading}>
          {loginMutation.isPending
            ? LOGIN_MODAL_UI.SUBMIT_LOADING
            : LOGIN_MODAL_UI.SUBMIT_IDLE}
        </button>
        <button
          type="button"
          className="login-modal__register"
          disabled={isLoading}
          onClick={() => {
            resetForm();
            onClose();
            navigate(AUTH_FORGOT_PASSWORD_PATH);
          }}
        >
          {AUTH_UI.FORGOT_PASSWORD_LINK}
        </button>
        {typeof onRegisterClick === "function" ? (
          <button
            type="button"
            className="login-modal__register"
            disabled={isLoading}
            onClick={handleRegisterClick}
          >
            {LOGIN_MODAL_UI.REGISTER_BUTTON}
          </button>
        ) : null}
      </form>
    </ProductModalShell>
  );
}
