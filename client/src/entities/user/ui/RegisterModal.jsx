import { useState } from "react";

import { useRegisterMutation } from "../model/useRegisterMutation.js";
import { buildRegisterUserPayload } from "../lib/buildRegisterUserPayload.js";
import { getRegisterEmptyRequiredFieldKeys } from "../lib/getRegisterEmptyRequiredFieldKeys.js";
import { validatePasswordConfirm } from "../lib/validatePasswordConfirm.js";
import { validateUserNameField } from "../lib/validateUserName.js";
import { LOGIN_MODAL_UI, REGISTER_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { isAuthSessionError } from "../../../shared/lib/isAuthSessionError.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";

import "./RegisterModal.css";

const REGISTER_MODAL_TITLE_ID = "register-modal-title";

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
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSuccess?: () => void;
 * }} props
 */
export function RegisterModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const registerMutation = useRegisterMutation();
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
      await registerMutation.mutateAsync(payload);
      setForm(INITIAL_FORM);
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

  const handleClose = () => {
    setStatus({ kind: "idle", message: "" });
    setInvalidFields(new Set());
    registerMutation.reset();
    onClose();
  };

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
            <input
              className={withInvalidFieldClass(
                "register-modal__input",
                "password",
                invalidFields,
              )}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={invalidFields.has("password")}
              autoComplete="new-password"
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
            <input
              className={withInvalidFieldClass(
                "register-modal__input",
                "passwordConfirm",
                invalidFields,
              )}
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={invalidFields.has("passwordConfirm")}
              autoComplete="new-password"
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
            <span className="register-modal__hint">{REGISTER_MODAL_UI.USERNAME_HINT}</span>
          </label>
        </div>
        <div className="register-modal__footer">
          <div className="register-modal__feedback" aria-live="polite">
            {status.kind === "error" ? (
              <p
                className="register-modal__message register-modal__message_error"
                role="alert"
              >
                {status.message}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            className="register-modal__submit"
            disabled={status.kind === "loading"}
          >
            {status.kind === "loading"
              ? REGISTER_MODAL_UI.SUBMIT_LOADING
              : REGISTER_MODAL_UI.SUBMIT_IDLE}
          </button>
        </div>
      </form>
    </ProductModalShell>
  );
}
