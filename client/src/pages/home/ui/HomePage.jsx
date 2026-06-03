import { useHomePageController } from "../model/useHomePageController.js";

import { CartServerSync } from "../../../entities/cart/ui/CartServerSync.jsx";
import { EmailVerificationBanner } from "../../../entities/user/ui/EmailVerificationBanner.jsx";
import { EmailVerificationNotice } from "../../../entities/user/ui/EmailVerificationNotice.jsx";
import { SiteFooter } from "../../../widgets/site-footer/ui/SiteFooter.jsx";
import { getHomePageVariantClass } from "../lib/homeHeaderVariant.js";
import "../../../entities/product-category-display/ui/CatalogCategoriesGrid.css";
import "../../../entities/product-category-display/ui/CatalogFeedTilesGrid.css";

import { HomePageHeader } from "./HomePageHeader.jsx";
import { HomePageMainContent } from "./HomePageMainContent.jsx";
import { HomePageModalsLayer } from "./HomePageModalsLayer.jsx";

import "./HomePage.css";

export function HomePage() {
  const {
    isAuthorized,
    isSessionReady,
    isEmailVerified,
    emailVerificationNotice,
    dismissEmailVerificationNotice,
    staffActionNotice,
    headerProps,
    mainContentProps,
    modalsLayerProps,
  } = useHomePageController();

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

      <HomePageMainContent {...mainContentProps} />

      <SiteFooter />

      <HomePageModalsLayer {...modalsLayerProps} />
    </div>
  );
}
