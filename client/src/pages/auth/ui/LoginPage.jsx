import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { useGuestProfileLoginMenuBannerImageQuery } from "../../../entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery.js";
import {
  assertAuthenticatedProfile,
  fetchCurrentUserProfile,
} from "../../../entities/user/api/fetchCurrentUserProfile.js";
import { loginUser } from "../../../entities/user/api/loginUser.js";
import { loginUserByPhonePassword } from "../../../entities/user/api/phoneAuth.js";
import {
  cancelAuthMeQuery,
  hydrateAuthMeCache,
} from "../../../entities/user/lib/authMeQueryCache.js";
import { maskRuPhoneInput } from "../../../entities/user/lib/ruPhone.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { resetAuthSessionState } from "../../../shared/api/apiClient.js";
import {
  API_CLIENT_UI,
  AUTH_UI,
  LOGIN_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { AUTH_REGISTER_PATH, AUTH_FORGOT_PASSWORD_PATH } from "../../../shared/lib/authPaths.js";
import { isAuthSessionError } from "../../../shared/lib/isAuthSessionError.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { useStableAuthHeroHeight } from "../../../shared/lib/useStableAuthHeroHeight.js";
import { AuthHeroBanner } from "../../../shared/ui/AuthHeroBanner/AuthHeroBanner.jsx";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { PasswordInputField } from "../../../shared/ui/PasswordInputField/PasswordInputField.jsx";

import "./AuthPage.css";

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const heroHeight = useStableAuthHeroHeight();
  const { isAuthorized, isSessionReady } = useAuthSession();
  const [channel, setChannel] = useState(/** @type {"email" | "phone"} */ ("email"));
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const bannerQuery = useGuestProfileLoginMenuBannerImageQuery();
  const bannerImageUrl = bannerQuery.data
    ? resolveUploadedImageUrl(bannerQuery.data)
    : null;

  const loginMutation = useMutation({
    onMutate: async () => {
      resetAuthSessionState();
      await cancelAuthMeQuery(queryClient);
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

  const isPending = loginMutation.isPending;

  useEffect(() => {
    if (isSessionReady && isAuthorized) {
      navigate("/me", { replace: true });
    }
  }, [isAuthorized, isSessionReady, navigate]);

  const errorMessage =
    localError ||
    (loginMutation.isError
      ? loginMutation.error instanceof Error && isAuthSessionError(loginMutation.error)
        ? LOGIN_MODAL_UI.SESSION_VERIFY_FALLBACK
        : loginMutation.error instanceof Error
          ? loginMutation.error.message
          : API_CLIENT_UI.LOGIN_FALLBACK
      : "");

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/", { replace: true });
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
      navigate("/me", { replace: true });
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
          <h1 className="auth-page__title">{AUTH_UI.LOGIN_TITLE}</h1>
          <p className="auth-page__subtitle">{AUTH_UI.LOGIN_SUBTITLE}</p>

          <form className="auth-page__form" onSubmit={handleSubmit}>
            <div className="auth-page__channel" role="group" aria-label="Способ входа">
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
                />
              </label>
            )}

            <label className="auth-page__field">
              <span className="auth-page__label">{AUTH_UI.PASSWORD_LABEL}</span>
              <PasswordInputField
                className="auth-page__input"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              disabled={isPending}
            >
              {loginMutation.isPending
                ? LOGIN_MODAL_UI.SUBMIT_LOADING
                : AUTH_UI.LOGIN_BUTTON}
            </button>

            <button
              type="button"
              className="auth-page__link"
              disabled={isPending}
              onClick={() => navigate(AUTH_FORGOT_PASSWORD_PATH)}
            >
              {AUTH_UI.FORGOT_PASSWORD_LINK}
            </button>

            <button
              type="button"
              className="auth-page__link"
              disabled={isPending}
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
