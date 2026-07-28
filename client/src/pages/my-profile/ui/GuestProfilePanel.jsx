import { Link, useNavigate } from "react-router-dom";

import { useGuestProfileLoginMenuBannerImageQuery } from "../../../entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery.js";
import { AUTH_UI, LEGAL_UI } from "../../../shared/config/appUiCopy.js";
import { AUTH_LOGIN_PATH } from "../../../shared/lib/authPaths.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { useStableAuthHeroHeight } from "../../../shared/lib/useStableAuthHeroHeight.js";
import { AuthHeroBanner } from "../../../shared/ui/AuthHeroBanner/AuthHeroBanner.jsx";

import "./GuestProfilePanel.css";

export function GuestProfilePanel() {
  const navigate = useNavigate();
  const heroHeight = useStableAuthHeroHeight();
  const bannerQuery = useGuestProfileLoginMenuBannerImageQuery();
  const bannerImageUrl = bannerQuery.data
    ? resolveUploadedImageUrl(bannerQuery.data)
    : null;

  return (
    <section className="guest-profile">
      <div className="guest-profile__column">
        <AuthHeroBanner height={heroHeight} imageUrl={bannerImageUrl} />
        <div className="guest-profile__body">
          <h1 className="guest-profile__title">{AUTH_UI.PROFILE_TITLE}</h1>
          <p className="guest-profile__subtitle">{AUTH_UI.GUEST_STATUS}</p>
          <div className="guest-profile__actions">
            <button
              type="button"
              className="app-btn app-btn--primary guest-profile__action"
              onClick={() => navigate(AUTH_LOGIN_PATH)}
            >
              {AUTH_UI.GUEST_PROFILE_ACTION_BUTTON}
            </button>
          </div>
          <Link className="guest-profile__legal" to="/legal/privacy">
            {LEGAL_UI.PRIVACY_LINK}
          </Link>
        </div>
      </div>
    </section>
  );
}
