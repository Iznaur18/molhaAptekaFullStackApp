import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { useGuestProfileLoginMenuBannerImageQuery } from "../../../entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery.js";
import {
  confirmPasswordReset,
  requestPasswordReset,
} from "../../../entities/user/api/passwordReset.js";
import { maskRuPhoneInput } from "../../../entities/user/lib/ruPhone.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import {
  API_CLIENT_UI,
  AUTH_UI,
  LOGIN_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { AUTH_LOGIN_PATH } from "../../../shared/lib/authPaths.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { useStableAuthHeroHeight } from "../../../shared/lib/useStableAuthHeroHeight.js";
import { AuthHeroBanner } from "../../../shared/ui/AuthHeroBanner/AuthHeroBanner.jsx";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { PasswordInputField } from "../../../shared/ui/PasswordInputField/PasswordInputField.jsx";

import "./AuthPage.css";

/**
 * @typedef {"email" | "phone"} ResetChannel
 * @typedef {"request" | "confirm" | "done"} ResetStep
 */

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const heroHeight = useStableAuthHeroHeight();
  const { isAuthorized, isSessionReady } = useAuthSession();

  const [channel, setChannel] = useState(/** @type {ResetChannel} */ ("email"));
  const [step, setStep] = useState(/** @type {ResetStep} */ ("request"));
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [localError, setLocalError] = useState("");
  const [notice, setNotice] = useState("");

  const bannerQuery = useGuestProfileLoginMenuBannerImageQuery();
  const bannerImageUrl = bannerQuery.data
    ? resolveUploadedImageUrl(bannerQuery.data)
    : null;

  const requestMutation = useMutation({
    mutationFn: requestPasswordReset,
  });
  const confirmMutation = useMutation({
    mutationFn: confirmPasswordReset,
  });

  const isPending = requestMutation.isPending || confirmMutation.isPending;

  useEffect(() => {
    if (isSessionReady && isAuthorized) {
      navigate("/me", { replace: true });
    }
  }, [isAuthorized, isSessionReady, navigate]);

  const contactPayload = () =>
    channel === "email"
      ? { email: email.trim() }
      : { phoneNumber: phoneNumber.trim() };

  const errorMessage =
    localError ||
    (requestMutation.isError
      ? requestMutation.error instanceof Error
        ? requestMutation.error.message
                : API_CLIENT_UI.INVALID_SERVER_RESPONSE
      : "") ||
    (confirmMutation.isError
      ? confirmMutation.error instanceof Error
        ? confirmMutation.error.message
        : API_CLIENT_UI.INVALID_SERVER_RESPONSE
      : "");

  const handleBack = () => {
    if (step === "confirm") {
      setStep("request");
      setLocalError("");
      setCode("");
      setNewPassword("");
      setNewPasswordConfirm("");
      confirmMutation.reset();
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(AUTH_LOGIN_PATH, { replace: true });
  };

  const handleRequest = async (event) => {
    event.preventDefault();
    setLocalError("");
    setNotice("");
    if (channel === "phone" && !String(phoneNumber).trim()) {
      setLocalError(LOGIN_MODAL_UI.ERROR_PHONE_REQUIRED);
      return;
    }
    if (channel === "email" && !String(email).trim()) {
      setLocalError(AUTH_UI.FORGOT_ERROR_EMAIL_REQUIRED);
      return;
    }
    try {
      const data = await requestMutation.mutateAsync(contactPayload());
      setNotice(data?.message || AUTH_UI.FORGOT_CODE_SENT);
      setStep("confirm");
    } catch {
      // mutation state
    }
  };

  const handleConfirm = async (event) => {
    event.preventDefault();
    setLocalError("");
    if (String(code).trim().length !== AUTH_UI.FORGOT_CODE_LENGTH) {
      setLocalError(AUTH_UI.FORGOT_ERROR_CODE_REQUIRED);
      return;
    }
    if (newPassword.length < LOGIN_MODAL_UI.PASSWORD_MIN_LENGTH) {
      setLocalError(AUTH_UI.FORGOT_ERROR_PASSWORD_TOO_SHORT);
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setLocalError(AUTH_UI.FORGOT_ERROR_PASSWORD_MISMATCH);
      return;
    }
    try {
      await confirmMutation.mutateAsync({
        ...contactPayload(),
        code: code.trim(),
        newPassword,
        newPasswordConfirm,
      });
      setStep("done");
    } catch {
      // mutation state
    }
  };

  const handleResend = async () => {
    setLocalError("");
    try {
      const data = await requestMutation.mutateAsync(contactPayload());
      setNotice(data?.message || AUTH_UI.FORGOT_CODE_SENT);
    } catch {
      // mutation state
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-page__column">
        <button
          type="button"
          className="auth-page__back"
          aria-label={AUTH_UI.BACK_BUTTON}
          onClick={handleBack}
          disabled={isPending}
        >
          <AppIcon icon={ChevronLeft} size="md" strokeWidth={2.25} />
        </button>

        <AuthHeroBanner height={heroHeight} imageUrl={bannerImageUrl} />

        <div className="auth-page__body">
          <h1 className="auth-page__title">{AUTH_UI.FORGOT_TITLE}</h1>
          <p className="auth-page__subtitle">
            {step === "done"
              ? AUTH_UI.FORGOT_DONE_SUBTITLE
              : step === "confirm"
                ? AUTH_UI.FORGOT_CONFIRM_SUBTITLE
                : AUTH_UI.FORGOT_SUBTITLE}
          </p>

          {step === "done" ? (
            <div className="auth-page__form">
              <p className="auth-page__notice" role="status">
                {AUTH_UI.FORGOT_DONE_MESSAGE}
              </p>
              <button
                type="button"
                className="app-btn app-btn--primary auth-page__submit"
                onClick={() => navigate(AUTH_LOGIN_PATH, { replace: true })}
              >
                {AUTH_UI.GO_TO_LOGIN}
              </button>
            </div>
          ) : step === "confirm" ? (
            <form className="auth-page__form" onSubmit={handleConfirm}>
              {notice ? (
                <p className="auth-page__notice" role="status">
                  {notice}
                </p>
              ) : null}
              <label className="auth-page__field">
                <span className="auth-page__label">
                  {channel === "email"
                    ? AUTH_UI.FORGOT_CODE_LABEL_EMAIL
                    : AUTH_UI.FORGOT_CODE_LABEL_SMS}
                </span>
                <input
                  className="auth-page__input"
                  type="text"
                  inputMode="numeric"
                  name="code"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, AUTH_UI.FORGOT_CODE_LENGTH))
                  }
                  required
                  autoComplete="one-time-code"
                  placeholder={AUTH_UI.FORGOT_CODE_PLACEHOLDER}
                  disabled={isPending}
                />
              </label>
              <label className="auth-page__field">
                <span className="auth-page__label">{AUTH_UI.FORGOT_NEW_PASSWORD_LABEL}</span>
                <PasswordInputField
                  className="auth-page__input"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={LOGIN_MODAL_UI.PASSWORD_MIN_LENGTH}
                  autoComplete="new-password"
                  disabled={isPending}
                  showPasswordAria={AUTH_UI.SHOW_PASSWORD_ARIA}
                  hidePasswordAria={AUTH_UI.HIDE_PASSWORD_ARIA}
                />
              </label>
              <label className="auth-page__field">
                <span className="auth-page__label">
                  {AUTH_UI.FORGOT_NEW_PASSWORD_CONFIRM_LABEL}
                </span>
                <PasswordInputField
                  className="auth-page__input"
                  name="newPasswordConfirm"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  required
                  minLength={LOGIN_MODAL_UI.PASSWORD_MIN_LENGTH}
                  autoComplete="new-password"
                  disabled={isPending}
                  showPasswordAria={AUTH_UI.SHOW_PASSWORD_ARIA}
                  hidePasswordAria={AUTH_UI.HIDE_PASSWORD_ARIA}
                />
              </label>
              {errorMessage ? (
                <p className="auth-page__error" role="alert">
                  {errorMessage}
                </p>
              ) : null}
              <button
                type="submit"
                className="app-btn app-btn--primary auth-page__submit"
                disabled={isPending}
              >
                {confirmMutation.isPending
                  ? AUTH_UI.FORGOT_CONFIRM_LOADING
                  : AUTH_UI.FORGOT_CONFIRM_BUTTON}
              </button>
              <button
                type="button"
                className="auth-page__link"
                disabled={isPending}
                onClick={handleResend}
              >
                {requestMutation.isPending
                  ? AUTH_UI.FORGOT_RESEND_LOADING
                  : AUTH_UI.FORGOT_RESEND_BUTTON}
              </button>
            </form>
          ) : (
            <form className="auth-page__form" onSubmit={handleRequest}>
              <div className="auth-page__channel" role="group" aria-label="Способ восстановления">
                <button
                  type="button"
                  className={
                    channel === "email"
                      ? "auth-page__channel-btn auth-page__channel-btn--active"
                      : "auth-page__channel-btn"
                  }
                  onClick={() => setChannel("email")}
                  disabled={isPending}
                >
                  {LOGIN_MODAL_UI.CHANNEL_EMAIL}
                </button>
                <button
                  type="button"
                  className={
                    channel === "phone"
                      ? "auth-page__channel-btn auth-page__channel-btn--active"
                      : "auth-page__channel-btn"
                  }
                  onClick={() => setChannel("phone")}
                  disabled={isPending}
                >
                  {LOGIN_MODAL_UI.CHANNEL_PHONE}
                </button>
              </div>

              {channel === "email" ? (
                <label className="auth-page__field">
                  <span className="auth-page__label">{AUTH_UI.EMAIL_LABEL}</span>
                  <input
                    className="auth-page__input"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder={AUTH_UI.EMAIL_PLACEHOLDER}
                    disabled={isPending}
                  />
                </label>
              ) : (
                <label className="auth-page__field">
                  <span className="auth-page__label">{LOGIN_MODAL_UI.LABEL_PHONE}</span>
                  <input
                    className="auth-page__input"
                    type="tel"
                    name="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(maskRuPhoneInput(e.target.value))}
                    required
                    autoComplete="tel"
                    placeholder="8 (912) 345-67-89"
                    disabled={isPending}
                  />
                </label>
              )}

              {errorMessage ? (
                <p className="auth-page__error" role="alert">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                className="app-btn app-btn--primary auth-page__submit"
                disabled={isPending}
              >
                {requestMutation.isPending
                  ? AUTH_UI.FORGOT_SEND_LOADING
                  : AUTH_UI.FORGOT_SEND_BUTTON}
              </button>

              <button
                type="button"
                className="auth-page__link"
                disabled={isPending}
                onClick={() => navigate(AUTH_LOGIN_PATH)}
              >
                {AUTH_UI.GO_TO_LOGIN}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
