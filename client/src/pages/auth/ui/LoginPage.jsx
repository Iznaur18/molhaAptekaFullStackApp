import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useGuestProfileLoginMenuBannerImageQuery } from "../../../entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { useLoginMutation } from "../../../entities/user/model/useLoginMutation.js";
import {
  API_CLIENT_UI,
  AUTH_UI,
  LOGIN_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import {
  AUTH_REGISTER_PATH,
} from "../../../shared/lib/authPaths.js";
import { isAuthSessionError } from "../../../shared/lib/isAuthSessionError.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { useStableAuthHeroHeight } from "../../../shared/lib/useStableAuthHeroHeight.js";
import { AuthHeroBanner } from "../../../shared/ui/AuthHeroBanner/AuthHeroBanner.jsx";
import { PasswordInputField } from "../../../shared/ui/PasswordInputField/PasswordInputField.jsx";

import "./AuthPage.css";

const INITIAL_FORM = {
  email: "",
  password: "",
};

export function LoginPage() {
  const navigate = useNavigate();
  const heroHeight = useStableAuthHeroHeight();
  const { isAuthorized, isSessionReady } = useAuthSession();
  const loginMutation = useLoginMutation();
  const [form, setForm] = useState(INITIAL_FORM);
  const bannerQuery = useGuestProfileLoginMenuBannerImageQuery();
  const bannerImageUrl = bannerQuery.data
    ? resolveUploadedImageUrl(bannerQuery.data)
    : null;

  useEffect(() => {
    if (isSessionReady && isAuthorized) {
      navigate("/me", { replace: true });
    }
  }, [isAuthorized, isSessionReady, navigate]);

  const errorMessage = loginMutation.isError
    ? loginMutation.error instanceof Error && isAuthSessionError(loginMutation.error)
      ? LOGIN_MODAL_UI.SESSION_VERIFY_FALLBACK
      : loginMutation.error instanceof Error
        ? loginMutation.error.message
        : API_CLIENT_UI.LOGIN_FALLBACK
    : "";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await loginMutation.mutateAsync(form);
      setForm(INITIAL_FORM);
      navigate("/me", { replace: true });
    } catch {
      // status derived from mutation
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-page__column">
        <button
          type="button"
          className="auth-page__back"
          onClick={handleBack}
          disabled={loginMutation.isPending}
        >
          {AUTH_UI.BACK_BUTTON}
        </button>

        <AuthHeroBanner height={heroHeight} imageUrl={bannerImageUrl} />

        <div className="auth-page__body">
          <h1 className="auth-page__title">{AUTH_UI.LOGIN_TITLE}</h1>
          <p className="auth-page__subtitle">{AUTH_UI.LOGIN_SUBTITLE}</p>

          <form className="auth-page__form" onSubmit={handleSubmit}>
            <label className="auth-page__field">
              <span className="auth-page__label">{AUTH_UI.EMAIL_LABEL}</span>
              <input
                className="auth-page__input"
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
              <span className="auth-page__label">{AUTH_UI.PASSWORD_LABEL}</span>
              <PasswordInputField
                className="auth-page__input"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={LOGIN_MODAL_UI.PASSWORD_MIN_LENGTH}
                autoComplete="current-password"
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
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? LOGIN_MODAL_UI.SUBMIT_LOADING
                : AUTH_UI.LOGIN_BUTTON}
            </button>

            <button
              type="button"
              className="auth-page__link"
              disabled={loginMutation.isPending}
              onClick={() => navigate(AUTH_REGISTER_PATH)}
            >
              {AUTH_UI.GO_TO_REGISTER}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
