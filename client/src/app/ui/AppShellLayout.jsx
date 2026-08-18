import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { CartServerSync } from "../../entities/cart/ui/CartServerSync.jsx";
import { WishlistServerSync } from "../../entities/wishlist/ui/WishlistServerSync.jsx";
import { EmailVerificationNotice } from "../../entities/user/ui/EmailVerificationNotice.jsx";
import { lazyNamedExport } from "../../shared/lib/lazyNamedExport.js";
import { getAppShellVariantClass } from "../lib/appShellVariant.js";
import { buildAppShellRouteKey } from "../lib/buildAppShellRouteKey.js";
import { useAppShell } from "../model/AppShellContext.jsx";

import { AppShellHeader } from "./AppShellHeader.jsx";
import { AppShellRouteSuspense } from "./AppShellRouteSuspense.jsx";

import "./AppShell.css";

const LazyAppShellModalsLayer = lazyNamedExport(
  () => import("./AppShellModalsLayer.jsx"),
  "AppShellModalsLayer",
);

/** Главный экран каталога `/` — единственное место с панелью шапки. */
function isHomeCatalogPathname(pathname) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === "/";
}

export function AppShellLayout() {
  const location = useLocation();
  const {
    isAuthorized,
    emailVerificationNotice,
    dismissEmailVerificationNotice,
    staffActionNotice,
    headerProps,
    modalsLayerProps,
  } = useAppShell();

  const showAppShellHeader = isHomeCatalogPathname(location.pathname);

  return (
    <div className={`app-shell ${getAppShellVariantClass()}`}>
      <CartServerSync isAuthorized={isAuthorized} />
      <WishlistServerSync isAuthorized={isAuthorized} />
      <AppShellHeader {...headerProps} showHeaderPanel={showAppShellHeader} />

      <EmailVerificationNotice
        notice={emailVerificationNotice}
        onDismiss={dismissEmailVerificationNotice}
      />

      {staffActionNotice ? (
        <p className="app-shell__state app-shell__state_notice" role="status">
          {staffActionNotice}
        </p>
      ) : null}

      <AppShellRouteSuspense routeKey={buildAppShellRouteKey(location)}>
        <Outlet />
      </AppShellRouteSuspense>

      <Suspense fallback={null}>
        <LazyAppShellModalsLayer {...modalsLayerProps} />
      </Suspense>
    </div>
  );
}
