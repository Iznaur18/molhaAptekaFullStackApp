import { Outlet, useLocation } from "react-router-dom";

import { CartServerSync } from "../../entities/cart/ui/CartServerSync.jsx";
import { EmailVerificationBanner } from "../../entities/user/ui/EmailVerificationBanner.jsx";
import { EmailVerificationNotice } from "../../entities/user/ui/EmailVerificationNotice.jsx";
import { SiteFooter } from "../../widgets/site-footer/ui/SiteFooter.jsx";
import { getHomePageVariantClass } from "../../pages/home/lib/homeHeaderVariant.js";
import { HomePageHeader } from "../../pages/home/ui/HomePageHeader.jsx";
import { HomePageModalsLayer } from "../../pages/home/ui/HomePageModalsLayer.jsx";
import { HomePageRouteSuspense } from "../../pages/home/ui/HomePageRouteSuspense.jsx";
import { buildAppShellRouteKey } from "../lib/buildAppShellRouteKey.js";
import { useAppShell } from "../model/AppShellContext.jsx";

import "../../pages/home/ui/HomePage.css";

export function AppShellLayout() {
  const location = useLocation();
  const {
    isAuthorized,
    isSessionReady,
    isEmailVerified,
    emailVerificationNotice,
    dismissEmailVerificationNotice,
    staffActionNotice,
    headerProps,
    modalsLayerProps,
  } = useAppShell();

  return (
    <div className={`home-page ${getHomePageVariantClass()}`}>
      <CartServerSync isAuthorized={isAuthorized} />
      <HomePageHeader {...headerProps} />

      <EmailVerificationNotice
        notice={emailVerificationNotice}
        onDismiss={dismissEmailVerificationNotice}
      />

      {isAuthorized && isSessionReady && !isEmailVerified ? (
        <EmailVerificationBanner />
      ) : null}

      {staffActionNotice ? (
        <p className="home-page__state home-page__state_notice" role="status">
          {staffActionNotice}
        </p>
      ) : null}

      <HomePageRouteSuspense routeKey={buildAppShellRouteKey(location)}>
        <Outlet />
      </HomePageRouteSuspense>

      <SiteFooter />

      <HomePageModalsLayer {...modalsLayerProps} />
    </div>
  );
}
