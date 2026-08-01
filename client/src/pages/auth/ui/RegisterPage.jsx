import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { useGuestProfileLoginMenuBannerImageQuery } from "../../../entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery.js";
import { resendRegistrationCode } from "../../../entities/user/api/resendRegistrationCode.js";
import { buildRegisterUserPayload } from "../../../entities/user/lib/buildRegisterUserPayload.js";
import { getRegisterEmptyRequiredFieldKeys } from "../../../entities/user/lib/getRegisterEmptyRequiredFieldKeys.js";
import { validatePasswordConfirm } from "../../../entities/user/lib/validatePasswordConfirm.js";
import { validateUserNameField } from "../../../entities/user/lib/validateUserName.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { useConfirmRegistrationMutation } from "../../../entities/user/model/useConfirmRegistrationMutation.js";
import { useRegisterMutation } from "../../../entities/user/model/useRegisterMutation.js";
import { isRegisterConsentComplete } from "../../../features/legal/lib/isRegisterConsentComplete.js";
import { RegisterLegalConsentFields } from "../../../features/legal/ui/RegisterLegalConsentFields.jsx";
import {
  API_CLIENT_UI,
  AUTH_UI,
  LOGIN_MODAL_UI,
  REGISTER_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { AUTH_LOGIN_PATH } from "../../../shared/lib/authPaths.js";
import { isAuthSessionError } from "../../../shared/lib/isAuthSessionError.js";
import { keepDigitsOnly } from "../../../shared/lib/numericInput.js";
import { clearPersistedReferralCode } from "../../../shared/lib/referralCodeStorage.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { useStableAuthHeroHeight } from "../../../shared/lib/useStableAuthHeroHeight.js";
import { AuthHeroBanner } from "../../../shared/ui/AuthHeroBanner/AuthHeroBanner.jsx";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { PasswordInputField } from "../../../shared/ui/PasswordInputField/PasswordInputField.jsx";

import "./AuthPage.css";

const REGISTER_CODE_LENGTH = 6;

const INITIAL_FORM = {
  email: "",
  password: "",
  passwordConfirm: "",
  userName: "",
};

/**
 * @param {string} baseClass
 * @param {string} fieldKey
 * @param {Set<string>} invalidFields
 */
const withInvalidFieldClass = (baseClass, fieldKey, invalidFields) =>
  invalidFields.has(fieldKey) ? `${baseClass} ${baseClass}--invalid` : baseClass;

export function RegisterPage() {
  const navigate = useNavigate();
  const heroHeight = useStableAuthHeroHeight();
  const { isAuthorized, isSessionReady } = useAuthSession();
  const registerMutation = useRegisterMutation();
  const confirmMutation = useConfirmRegistrationMutation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [step, setStep] = useState(/** @type {"form" | "code"} */ ("form"));
  const [pendingRegistration, setPendingRegistration] = useState(
    /** @type {{ registrationId: string; email: string } | null} */ (null),
  );
  const [code, setCode] = useState("");
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const [invalidFields, setInvalidFields] = useState(
    /** @type {Set<string>} */ (() => new Set()),
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [personalDataConsentAccepted, setPersonalDataConsentAccepted] =
    useState(false);

  const bannerQuery = useGuestProfileLoginMenuBannerImageQuery();
  const bannerImageUrl = bannerQuery.data
    ? resolveUploadedImageUrl(bannerQuery.data)
    : null;

  const isPending =
    status.kind === "loading" ||
    registerMutation.isPending ||
    confirmMutation.isPending;

  useEffect(() => {
    if (isSessionReady && isAuthorized) {
      navigate("/me", { replace: true });
    }
  }, [isAuthorized, isSessionReady, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;
    if (name === "userName" && typeof nextValue === "string") {
      nextValue = nextValue.toLowerCase().replace(/[^a-z0-9]/g, "");
    }
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setInvalidFields((prev) => {
      if (!prev.has(name)) return prev;
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  };

  const handleBack = () => {
    if (pendingRegistration) {
      setStep("form");
      setPendingRegistration(null);
      setCode("");
      setStatus({ kind: "idle", message: "" });
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !isRegisterConsentComplete({
        termsAccepted,
        personalDataConsentAccepted,
      })
    ) {
      setStatus({
        kind: "error",
        message: AUTH_UI.REGISTER_CONSENT_REQUIRED,
      });
      return;
    }

    const emptyRequired = getRegisterEmptyRequiredFieldKeys(form);
    if (emptyRequired.length > 0) {
      setInvalidFields(new Set(emptyRequired));
      setStatus({
        kind: "error",
        message: REGISTER_MODAL_UI.ERROR_REQUIRED_FIELDS,
      });
      return;
    }
    setInvalidFields(new Set());

    const passwordError = validatePasswordConfirm(
      form.password,
      form.passwordConfirm,
    );
    if (passwordError) {
      setInvalidFields(new Set(["password", "passwordConfirm"]));
      setStatus({ kind: "error", message: passwordError });
      return;
    }

    const userNameError = validateUserNameField(form.userName, { required: true });
    if (userNameError) {
      setInvalidFields(new Set(["userName"]));
      setStatus({ kind: "error", message: userNameError });
      return;
    }

    setStatus({ kind: "loading", message: "" });

    try {
      const payload = buildRegisterUserPayload(form);
      const pending = await registerMutation.mutateAsync(payload);
      setPendingRegistration(pending);
      setCode("");
      setStep("code");
      setInvalidFields(new Set());
      setStatus({ kind: "idle", message: "" });
    } catch (error) {
      const message =
        error instanceof Error && isAuthSessionError(error)
          ? LOGIN_MODAL_UI.SESSION_VERIFY_FALLBACK
          : error instanceof Error
            ? error.message
            : API_CLIENT_UI.REGISTER_FALLBACK;
      setStatus({ kind: "error", message });
    }
  };

  const handleCodeChange = (event) => {
    setCode(keepDigitsOnly(event.target.value).slice(0, REGISTER_CODE_LENGTH));
    setStatus((prev) => (prev.message ? { kind: "idle", message: "" } : prev));
  };

  const handleConfirm = async (event) => {
    event.preventDefault();
    if (!pendingRegistration) return;

    if (code.length !== REGISTER_CODE_LENGTH) {
      setStatus({ kind: "error", message: AUTH_UI.REGISTER_CODE_REQUIRED });
      return;
    }

    setStatus({ kind: "loading", message: "" });

    try {
      await confirmMutation.mutateAsync({
        registrationId: pendingRegistration.registrationId,
        code,
      });
      clearPersistedReferralCode();
      setForm(INITIAL_FORM);
      setPendingRegistration(null);
      setCode("");
      setStep("form");
      setInvalidFields(new Set());
      setStatus({ kind: "idle", message: "" });
      navigate("/me", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error && isAuthSessionError(error)
          ? LOGIN_MODAL_UI.SESSION_VERIFY_FALLBACK
          : error instanceof Error
            ? error.message
            : API_CLIENT_UI.REGISTER_FALLBACK;
      setStatus({ kind: "error", message });
    }
  };

  const handleResend = async () => {
    if (!pendingRegistration) return;

    setStatus({ kind: "loading", message: "" });
    try {
      const message = await resendRegistrationCode({
        registrationId: pendingRegistration.registrationId,
      });
      setCode("");
      setStatus({
        kind: "success",
        message: message || REGISTER_MODAL_UI.RESENT,
      });
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : API_CLIENT_UI.REGISTER_FALLBACK,
      });
    }
  };

  if (step === "code" && pendingRegistration) {
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
            <h1 className="auth-page__title">{AUTH_UI.REGISTER_CODE_TITLE}</h1>
            <p className="auth-page__subtitle">
              {AUTH_UI.REGISTER_CODE_SUBTITLE(pendingRegistration.email)}
            </p>
            <form className="auth-page__form" onSubmit={handleConfirm}>
              <label className="auth-page__field">
                <span className="auth-page__label">{AUTH_UI.REGISTER_CODE_LABEL}</span>
                <input
                  className="auth-page__input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder={AUTH_UI.REGISTER_CODE_PLACEHOLDER}
                  maxLength={REGISTER_CODE_LENGTH}
                  required
                />
              </label>
              {status.kind === "error" ? (
                <p className="auth-page__error" role="alert">
                  {status.message}
                </p>
              ) : null}
              {status.kind === "success" ? (
                <p className="auth-page__success">{status.message}</p>
              ) : null}
              <button
                type="submit"
                className="app-btn app-btn--primary auth-page__submit"
                disabled={isPending}
              >
                {isPending
                  ? REGISTER_MODAL_UI.CONFIRM_LOADING
                  : AUTH_UI.REGISTER_CODE_CONFIRM_BUTTON}
              </button>
              <button
                type="button"
                className="auth-page__ghost"
                disabled={isPending}
                onClick={handleResend}
              >
                {AUTH_UI.REGISTER_CODE_RESEND_BUTTON}
              </button>
              <button
                type="button"
                className="auth-page__link"
                disabled={isPending}
                onClick={() => {
                  setStep("form");
                  setCode("");
                  setStatus({ kind: "idle", message: "" });
                }}
              >
                {AUTH_UI.REGISTER_CODE_BACK_BUTTON}
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

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
          <h1 className="auth-page__title">{AUTH_UI.REGISTER_TITLE}</h1>
          <p className="auth-page__subtitle">{AUTH_UI.REGISTER_SUBTITLE}</p>

          <form className="auth-page__form" onSubmit={handleSubmit}>
            <label className="auth-page__field">
              <span className="auth-page__label">{AUTH_UI.EMAIL_LABEL}</span>
              <input
                className={withInvalidFieldClass(
                  "auth-page__input",
                  "email",
                  invalidFields,
                )}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder={AUTH_UI.EMAIL_PLACEHOLDER}
              />
            </label>

            <label className="auth-page__field">
              <span className="auth-page__label">{AUTH_UI.USER_NAME_LABEL}</span>
              <input
                className={withInvalidFieldClass(
                  "auth-page__input",
                  "userName",
                  invalidFields,
                )}
                name="userName"
                value={form.userName}
                onChange={handleChange}
                required
                autoComplete="username"
                minLength={REGISTER_MODAL_UI.USERNAME_MIN_LENGTH}
                maxLength={REGISTER_MODAL_UI.USERNAME_MAX_LENGTH}
                placeholder={AUTH_UI.USER_NAME_PLACEHOLDER}
              />
              <p className="auth-page__hint">{REGISTER_MODAL_UI.USERNAME_HINT}</p>
            </label>

            <label className="auth-page__field">
              <span className="auth-page__label">{AUTH_UI.PASSWORD_LABEL}</span>
              <PasswordInputField
                className={withInvalidFieldClass(
                  "auth-page__input",
                  "password",
                  invalidFields,
                )}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={REGISTER_MODAL_UI.PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
                showPasswordAria={AUTH_UI.SHOW_PASSWORD_ARIA}
                hidePasswordAria={AUTH_UI.HIDE_PASSWORD_ARIA}
              />
            </label>

            <label className="auth-page__field">
              <span className="auth-page__label">
                {AUTH_UI.PASSWORD_CONFIRM_LABEL}
              </span>
              <PasswordInputField
                className={withInvalidFieldClass(
                  "auth-page__input",
                  "passwordConfirm",
                  invalidFields,
                )}
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                required
                minLength={REGISTER_MODAL_UI.PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
                showPasswordAria={AUTH_UI.SHOW_PASSWORD_ARIA}
                hidePasswordAria={AUTH_UI.HIDE_PASSWORD_ARIA}
              />
            </label>

            <RegisterLegalConsentFields
              termsAccepted={termsAccepted}
              personalDataConsentAccepted={personalDataConsentAccepted}
              disabled={isPending}
              onTermsAcceptedChange={setTermsAccepted}
              onPersonalDataConsentAcceptedChange={setPersonalDataConsentAccepted}
            />

            {status.kind === "error" ? (
              <p className="auth-page__error" role="alert">
                {status.message}
              </p>
            ) : null}

            <button
              type="submit"
              className="app-btn app-btn--primary auth-page__submit"
              disabled={isPending}
            >
              {isPending
                ? REGISTER_MODAL_UI.SUBMIT_LOADING
                : AUTH_UI.REGISTER_BUTTON}
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
        </div>
      </div>
    </section>
  );
}
