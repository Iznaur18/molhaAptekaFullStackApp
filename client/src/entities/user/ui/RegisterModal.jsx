import { useState } from "react";

import { AUTH_TOKEN_STORAGE_KEY } from "../../../shared/api/index.js";
import { registerUser } from "../api/registerUser.js";
import { AddressDeliveryFields } from "../../address/ui/AddressDeliveryFields.jsx";
import { validateRuDeliveryAddressForm } from "../../address/lib/validateRuDeliveryAddressForm.js";
import { buildRegisterUserPayload } from "../lib/buildRegisterUserPayload.js";
import { limitRuPhoneInput, validateRuPhoneField } from "../lib/ruPhone.js";
import { validatePasswordConfirm } from "../lib/validatePasswordConfirm.js";
import { validateUserNameField } from "../lib/validateUserName.js";
import {
  USER_GENDER_FEMALE,
  USER_GENDER_MALE,
  USER_GENDER_NO_SELECTED,
  USER_GENDER_LABEL_RU,
} from "../model/userConstants.js";
import {
  COMMON_UI,
  REGISTER_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";

import "./RegisterModal.css";

const INITIAL_FORM = {
  email: "",
  password: "",
  passwordConfirm: "",
  userName: "",
  phoneNumber: "",
  avatarUrl: "",
  backgroundUrl: "",
  userBirthDate: "",
  userGender: USER_GENDER_NO_SELECTED,
  deliveryAddress: {
    line: "",
    flat: "",
    fiasId: "",
    geo: null,
    selectedFromSuggest: false,
  },
  notificationsEnabled: false,
};

const GENDER_OPTIONS = [
  USER_GENDER_MALE,
  USER_GENDER_FEMALE,
  USER_GENDER_NO_SELECTED,
];

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSuccess?: () => void;
 * }} props
 */
export function RegisterModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    let nextValue = type === "checkbox" ? checked : value;
    if (name === "userName" && typeof nextValue === "string") {
      nextValue = nextValue.toLowerCase().replace(/[^a-z0-9]/g, "");
    }
    if (name === "phoneNumber" && typeof nextValue === "string") {
      nextValue = limitRuPhoneInput(nextValue);
    }
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const passwordError = validatePasswordConfirm(
      form.password,
      form.passwordConfirm,
    );
    if (passwordError) {
      setStatus({ kind: "error", message: passwordError });
      return;
    }

    const userNameError = validateUserNameField(form.userName, { required: true });
    if (userNameError) {
      setStatus({ kind: "error", message: userNameError });
      return;
    }

    const phoneError = validateRuPhoneField(form.phoneNumber);
    if (phoneError) {
      setStatus({ kind: "error", message: phoneError });
      return;
    }

    const addressLine = String(form.deliveryAddress.line ?? "").trim();
    const addressFlat = String(form.deliveryAddress.flat ?? "").trim();
    const addressError =
      addressLine || addressFlat
        ? validateRuDeliveryAddressForm(form.deliveryAddress)
        : null;
    if (addressError) {
      setStatus({ kind: "error", message: addressError });
      return;
    }

    setStatus({ kind: "loading", message: "" });

    try {
      const payload = buildRegisterUserPayload(form);
      const { token } = await registerUser(payload);
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      setForm(INITIAL_FORM);
      setStatus({ kind: "success", message: REGISTER_MODAL_UI.SUCCESS });
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : REGISTER_MODAL_UI.ERROR_GENERIC;
      setStatus({ kind: "error", message });
    }
  };

  const handleClose = () => {
    setStatus({ kind: "idle", message: "" });
    onClose();
  };

  return (
    <div
      className="register-modal"
      role="dialog"
      aria-modal="true"
      aria-label={REGISTER_MODAL_UI.ARIA_DIALOG}
    >
      <button
        type="button"
        className="register-modal__backdrop"
        aria-label={REGISTER_MODAL_UI.ARIA_CLOSE_BACKDROP}
        onClick={handleClose}
      />
      <div className="register-modal__card">
        <div className="register-modal__header">
          <h2 className="register-modal__title">{REGISTER_MODAL_UI.TITLE}</h2>
          <button
            type="button"
            className="register-modal__close"
            onClick={handleClose}
          >
            {COMMON_UI.MODAL_CLOSE_GLYPH}
          </button>
        </div>
        <form className="register-modal__body" onSubmit={handleSubmit}>
          <div className="register-modal__scroll">
            <label className="register-modal__label">
              {REGISTER_MODAL_UI.LABEL_EMAIL}
              <input
                className="register-modal__input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </label>
            <label className="register-modal__label">
              {REGISTER_MODAL_UI.LABEL_PASSWORD}
              <input
                className="register-modal__input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={REGISTER_MODAL_UI.PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
              />
            </label>
            <label className="register-modal__label">
              {REGISTER_MODAL_UI.LABEL_PASSWORD_CONFIRM}
              <input
                className="register-modal__input"
                type="password"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                required
                minLength={REGISTER_MODAL_UI.PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
              />
            </label>
            <label className="register-modal__label">
              {REGISTER_MODAL_UI.LABEL_USERNAME}
              <input
                className="register-modal__input"
                type="text"
                name="userName"
                value={form.userName}
                onChange={handleChange}
                required
                minLength={REGISTER_MODAL_UI.USERNAME_MIN_LENGTH}
                maxLength={REGISTER_MODAL_UI.USERNAME_MAX_LENGTH}
                title={REGISTER_MODAL_UI.USERNAME_HINT}
                placeholder="nickname123"
                autoComplete="username"
              />
            </label>
            <label className="register-modal__label">
              {REGISTER_MODAL_UI.LABEL_PHONE}
              <input
                className="register-modal__input"
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                autoComplete="tel"
                inputMode="tel"
              />
            </label>
            <label className="register-modal__label">
              {REGISTER_MODAL_UI.LABEL_BIRTH}
              <input
                className="register-modal__input"
                type="date"
                name="userBirthDate"
                value={form.userBirthDate}
                onChange={handleChange}
              />
            </label>
            <label className="register-modal__label">
              {REGISTER_MODAL_UI.LABEL_GENDER}
              <select
                className="register-modal__input"
                name="userGender"
                value={form.userGender}
                onChange={handleChange}
              >
                {GENDER_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {USER_GENDER_LABEL_RU[value]}
                  </option>
                ))}
              </select>
            </label>
            <AddressDeliveryFields
              value={form.deliveryAddress}
              onChange={(deliveryAddress) =>
                setForm((prev) => ({ ...prev, deliveryAddress }))
              }
              lineInputClassName="register-modal__input"
              flatInputClassName="register-modal__input"
              labels={{ line: REGISTER_MODAL_UI.LABEL_ADDRESS }}
            />
            <label className="register-modal__label">
              {REGISTER_MODAL_UI.LABEL_AVATAR_URL}
              <input
                className="register-modal__input"
                type="url"
                name="avatarUrl"
                value={form.avatarUrl}
                onChange={handleChange}
                placeholder={REGISTER_MODAL_UI.PLACEHOLDER_HTTPS}
              />
            </label>
            <label className="register-modal__label">
              {REGISTER_MODAL_UI.LABEL_BG_URL}
              <input
                className="register-modal__input"
                type="url"
                name="backgroundUrl"
                value={form.backgroundUrl}
                onChange={handleChange}
                placeholder={REGISTER_MODAL_UI.PLACEHOLDER_HTTPS}
              />
            </label>
            <label className="register-modal__label register-modal__label_row">
              <input
                type="checkbox"
                name="notificationsEnabled"
                checked={form.notificationsEnabled}
                onChange={handleChange}
              />
              {REGISTER_MODAL_UI.LABEL_NOTIFICATIONS}
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
              {status.kind === "success" ? (
                <p className="register-modal__message register-modal__message_success">
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
      </div>
    </div>
  );
}
