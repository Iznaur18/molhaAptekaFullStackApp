import { useState } from "react";

import { AUTH_TOKEN_STORAGE_KEY } from "../../../shared/api/index.js";
import { LOGIN_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";
import { loginUser } from "../api/loginUser.js";

import "./LoginModal.css";

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
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ kind: "loading", message: "" });

    try {
      const { token } = await loginUser(form);
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      setForm(INITIAL_FORM);
      setStatus({ kind: "success", message: LOGIN_MODAL_UI.SUCCESS });
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : LOGIN_MODAL_UI.ERROR_GENERIC;
      setStatus({ kind: "error", message });
    }
  };

  const handleClose = () => {
    setStatus({ kind: "idle", message: "" });
    onClose();
  };

  const handleRegisterClick = () => {
    setStatus({ kind: "idle", message: "" });
    onRegisterClick?.();
  };

  return (
    <div
      className="login-modal"
      role="dialog"
      aria-modal="true"
      aria-label={LOGIN_MODAL_UI.ARIA_DIALOG}
    >
      <div className="login-modal__backdrop" aria-hidden="true" />
      <div className="login-modal__card">
        <div className="login-modal__header">
          <h2 className="login-modal__title">{LOGIN_MODAL_UI.TITLE}</h2>
          <button
            type="button"
            className="login-modal__close"
            onClick={handleClose}
          >
            <ModalCloseIcon />
          </button>
        </div>
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
            <p
              className="login-modal__message login-modal__message_error"
              role="alert"
            >
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
      </div>
    </div>
  );
}
