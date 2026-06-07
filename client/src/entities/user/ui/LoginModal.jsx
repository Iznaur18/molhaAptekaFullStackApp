import { useState } from "react";

import { LOGIN_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { isAuthSessionError } from "../../../shared/lib/isAuthSessionError.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { useLoginMutation } from "../model/useLoginMutation.js";

import "./LoginModal.css";

const LOGIN_MODAL_TITLE_ID = "login-modal-title";

const INITIAL_FORM = {
  email: "",
  password: "",
};

/**
 * @param {{
 * isOpen: boolean;
 * onClose: () => void;
 * onSuccess?: () => void;
 * onRegisterClick?: () => void;
 * }} props
 */
export function LoginModal({ isOpen, onClose, onSuccess, onRegisterClick }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const loginMutation = useLoginMutation();
  const status = loginMutation.isPending
    ? { kind: "loading", message: "" }
    : loginMutation.isError
      ? {
          kind: "error",
          message:
            loginMutation.error instanceof Error && isAuthSessionError(loginMutation.error)
              ? LOGIN_MODAL_UI.SESSION_VERIFY_FALLBACK
              : loginMutation.error instanceof Error
                ? loginMutation.error.message
                : LOGIN_MODAL_UI.ERROR_GENERIC,
        }
      : loginMutation.isSuccess
        ? { kind: "success", message: LOGIN_MODAL_UI.SUCCESS }
        : { kind: "idle", message: "" };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await loginMutation.mutateAsync(form);
      setForm(INITIAL_FORM);
      onSuccess?.();
    } catch {
      // status derived from mutation
    }
  };

  const handleClose = () => {
    loginMutation.reset();
    onClose();
  };

  const handleRegisterClick = () => {
    loginMutation.reset();
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
        <label className="login-modal__label">
          <FormFieldLabel required>{LOGIN_MODAL_UI.LABEL_EMAIL}</FormFieldLabel>
          <input
            className="login-modal__input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </label>
        <label className="login-modal__label">
          <FormFieldLabel required>{LOGIN_MODAL_UI.LABEL_PASSWORD}</FormFieldLabel>
          <input
            className="login-modal__input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={LOGIN_MODAL_UI.PASSWORD_MIN_LENGTH}
            autoComplete="current-password"
          />
        </label>
        {status.kind === "error" ? (
          <p className="login-modal__message login-modal__message_error" role="alert">
            {status.message}
          </p>
        ) : null}
        {status.kind === "success" ? (
          <p className="login-modal__message login-modal__message_success">
            {status.message}
          </p>
        ) : null}
        <button
          type="submit"
          className="login-modal__submit"
          disabled={status.kind === "loading"}
        >
          {status.kind === "loading"
            ? LOGIN_MODAL_UI.SUBMIT_LOADING
            : LOGIN_MODAL_UI.SUBMIT_IDLE}
        </button>
        {typeof onRegisterClick === "function" ? (
          <button
            type="button"
            className="login-modal__register"
            disabled={status.kind === "loading"}
            onClick={handleRegisterClick}
          >
            {LOGIN_MODAL_UI.REGISTER_BUTTON}
          </button>
        ) : null}
      </form>
    </ProductModalShell>
  );
}
