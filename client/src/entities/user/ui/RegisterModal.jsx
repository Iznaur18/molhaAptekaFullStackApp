import { useState } from "react";

import { useRegisterMutation } from "../model/useRegisterMutation.js";
import { useConfirmRegistrationMutation } from "../model/useConfirmRegistrationMutation.js";
import { resendRegistrationCode } from "../api/resendRegistrationCode.js";
import { buildRegisterUserPayload } from "../lib/buildRegisterUserPayload.js";
import { getRegisterEmptyRequiredFieldKeys } from "../lib/getRegisterEmptyRequiredFieldKeys.js";
import { validatePasswordConfirm } from "../lib/validatePasswordConfirm.js";
import { validateUserNameField } from "../lib/validateUserName.js";
import { LOGIN_MODAL_UI, REGISTER_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { isAuthSessionError } from "../../../shared/lib/isAuthSessionError.js";
import { keepDigitsOnly } from "../../../shared/lib/numericInput.js";
import { clearPersistedReferralCode } from "../../../shared/lib/referralCodeStorage.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";
import { PasswordInputField } from "../../../shared/ui/PasswordInputField/PasswordInputField.jsx";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";

import "./RegisterModal.css";

const REGISTER_MODAL_TITLE_ID = "register-modal-title";
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

/**
 * Регистрация в два шага: форма → код из письма. Аккаунт создаётся на
 * сервере только после подтверждения кода; закрытие модалки на шаге кода
 * ничего не оставляет в базе (заявка удалится по TTL).
 *
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSuccess?: () => void;
 * }} props
 */
export function RegisterModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const registerMutation = useRegisterMutation();
  const confirmMutation = useConfirmRegistrationMutation();
  const [step, setStep] = useState(/** @type {"form" | "code"} */ ("form"));
  const [pendingRegistration, setPendingRegistration] = useState(
    /** @type {{ registrationId: string; email: string } | null} */ (null),
  );
  const [code, setCode] = useState("");
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const [invalidFields, setInvalidFields] = useState(
    /** @type {Set<string>} */ (() => new Set()),
  );

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

  const handleSubmit = async (event) => {
    event.preventDefault();

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

    const passwordError = validatePasswordConfirm(form.password, form.passwordConfirm);
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
            : REGISTER_MODAL_UI.ERROR_GENERIC;
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
      setStatus({ kind: "error", message: REGISTER_MODAL_UI.CODE_REQUIRED });
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
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error && isAuthSessionError(error)
          ? LOGIN_MODAL_UI.SESSION_VERIFY_FALLBACK
          : error instanceof Error
            ? error.message
            : REGISTER_MODAL_UI.ERROR_GENERIC;
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
      setStatus({ kind: "success", message: message || REGISTER_MODAL_UI.RESENT });
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error ? error.message : REGISTER_MODAL_UI.ERROR_GENERIC,
      });
    }
  };

  const handleBackToForm = () => {
    setStep("form");
    setCode("");
    setStatus({ kind: "idle", message: "" });
  };

  const handleClose = () => {
    setStep("form");
    setPendingRegistration(null);
    setCode("");
    setStatus({ kind: "idle", message: "" });
    setInvalidFields(new Set());
    registerMutation.reset();
    confirmMutation.reset();
    onClose();
  };

  const isLoading = status.kind === "loading";
  const displayEmail =
    pendingRegistration?.email || form.email || REGISTER_MODAL_UI.CODE_STEP_EMAIL_FALLBACK;

  const feedback = (
    <div className="register-modal__feedback" aria-live="polite">
      {status.kind === "error" ? (
        <p className="register-modal__message register-modal__message_error" role="alert">
          {status.message}
        </p>
      ) : status.kind === "success" && status.message ? (
        <p
          className="register-modal__message register-modal__message_success"
          role="status"
        >
          {status.message}
        </p>
      ) : null}
    </div>
  );

  return (
    <ProductModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={REGISTER_MODAL_UI.TITLE}
      titleId={REGISTER_MODAL_TITLE_ID}
      ariaLabel={REGISTER_MODAL_UI.ARIA_DIALOG}
      size="md"
      panelClassName="register-modal__panel"
      bodyClassName="register-modal__shell-body"
    >
      {step === "code" ? (
        <form className="register-modal__body" onSubmit={handleConfirm} noValidate>
          <div className="register-modal__scroll">
            <p className="register-modal__code-text">
              {REGISTER_MODAL_UI.CODE_STEP_TEXT(displayEmail)}
            </p>
            <label className="register-modal__label">
              <FormFieldLabel required>{REGISTER_MODAL_UI.LABEL_CODE}</FormFieldLabel>
              <input
                className="register-modal__input"
                type="text"
                name="verificationCode"
                value={code}
                onChange={handleCodeChange}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={REGISTER_CODE_LENGTH}
                placeholder={REGISTER_MODAL_UI.CODE_PLACEHOLDER}
                disabled={isLoading}
                aria-required="true"
              />
            </label>
            <button
              type="button"
              className="register-modal__secondary"
              onClick={() => void handleResend()}
              disabled={isLoading}
            >
              {isLoading ? REGISTER_MODAL_UI.RESEND_LOADING : REGISTER_MODAL_UI.RESEND_BUTTON}
            </button>
            <button
              type="button"
              className="register-modal__secondary"
              onClick={handleBackToForm}
              disabled={isLoading}
            >
              {REGISTER_MODAL_UI.BACK_TO_FORM}
            </button>
          </div>
          <div className="register-modal__footer">
            {feedback}
            <button type="submit" className="register-modal__submit" disabled={isLoading}>
              {isLoading
                ? REGISTER_MODAL_UI.CONFIRM_LOADING
                : REGISTER_MODAL_UI.CONFIRM_IDLE}
            </button>
          </div>
        </form>
      ) : (
        <form className="register-modal__body" onSubmit={handleSubmit} noValidate>
          <div className="register-modal__scroll">
            <label
              className={withInvalidFieldClass(
                "register-modal__label",
                "email",
                invalidFields,
              )}
            >
              <FormFieldLabel required>{REGISTER_MODAL_UI.LABEL_EMAIL}</FormFieldLabel>
              <input
                className={withInvalidFieldClass(
                  "register-modal__input",
                  "email",
                  invalidFields,
                )}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={invalidFields.has("email")}
                autoComplete="email"
              />
            </label>
            <label
              className={withInvalidFieldClass(
                "register-modal__label",
                "password",
                invalidFields,
              )}
            >
              <FormFieldLabel required>{REGISTER_MODAL_UI.LABEL_PASSWORD}</FormFieldLabel>
              <PasswordInputField
                className={withInvalidFieldClass(
                  "register-modal__input",
                  "password",
                  invalidFields,
                )}
                name="password"
                value={form.password}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={invalidFields.has("password")}
                autoComplete="new-password"
                showPasswordAria={REGISTER_MODAL_UI.SHOW_PASSWORD_ARIA}
                hidePasswordAria={REGISTER_MODAL_UI.HIDE_PASSWORD_ARIA}
              />
            </label>
            <label
              className={withInvalidFieldClass(
                "register-modal__label",
                "passwordConfirm",
                invalidFields,
              )}
            >
              <FormFieldLabel required>
                {REGISTER_MODAL_UI.LABEL_PASSWORD_CONFIRM}
              </FormFieldLabel>
              <PasswordInputField
                className={withInvalidFieldClass(
                  "register-modal__input",
                  "passwordConfirm",
                  invalidFields,
                )}
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={invalidFields.has("passwordConfirm")}
                autoComplete="new-password"
                showPasswordAria={REGISTER_MODAL_UI.SHOW_PASSWORD_ARIA}
                hidePasswordAria={REGISTER_MODAL_UI.HIDE_PASSWORD_ARIA}
              />
            </label>
            <label
              className={withInvalidFieldClass(
                "register-modal__label",
                "userName",
                invalidFields,
              )}
            >
              <FormFieldLabel required>{REGISTER_MODAL_UI.LABEL_USERNAME}</FormFieldLabel>
              <input
                className={withInvalidFieldClass(
                  "register-modal__input",
                  "userName",
                  invalidFields,
                )}
                type="text"
                name="userName"
                value={form.userName}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={invalidFields.has("userName")}
                minLength={REGISTER_MODAL_UI.USERNAME_MIN_LENGTH}
                maxLength={REGISTER_MODAL_UI.USERNAME_MAX_LENGTH}
                title={REGISTER_MODAL_UI.USERNAME_HINT}
                placeholder="nickname123"
                autoComplete="username"
              />
              <span className="register-modal__hint">
                {REGISTER_MODAL_UI.USERNAME_HINT}
              </span>
            </label>
          </div>
          <div className="register-modal__footer">
            {feedback}
            <button type="submit" className="register-modal__submit" disabled={isLoading}>
              {isLoading
                ? REGISTER_MODAL_UI.SUBMIT_LOADING
                : REGISTER_MODAL_UI.SUBMIT_IDLE}
            </button>
          </div>
        </form>
      )}
    </ProductModalShell>
  );
}
