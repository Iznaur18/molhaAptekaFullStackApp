import { useEffect } from "react";
import { BrowserRouter, Routes, useLocation } from "react-router-dom";

import { AppQueryProvider } from "../shared/api/AppQueryProvider.jsx";
import { CartProvider } from "../entities/cart/model/CartContext.jsx";
import { WishlistProvider } from "../entities/wishlist/model/WishlistContext.jsx";
import { AppIntroProvider } from "../features/app-intro/model/AppIntroContext.jsx";
import { AppIntroSplash } from "../features/app-intro/ui/AppIntroSplash.jsx";
import { CookieNoticeHost } from "../features/legal/ui/CookieNoticeHost.jsx";
import { captureReferralCodeFromSearch } from "../shared/lib/referralCodeStorage.js";
import { captureAffiliateCodeFromSearch } from "../shared/lib/affiliateCodeStorage.js";
import { clearStaleChunkReloadFlag } from "../shared/lib/reloadOnceOnStaleChunk.js";
import { useReleaseStaleBodyScroll } from "../shared/lib/useReleaseStaleBodyScroll.js";
import { AppErrorBoundary } from "../shared/ui/AppErrorBoundary/AppErrorBoundary.jsx";
import { PlausiblePageviews } from "../shared/ui/PlausiblePageviews.jsx";
import { renderAppShellRoutes } from "./routes/appRoutes.jsx";

import "./App.css";

function CaptureAttributionCodes() {
  const location = useLocation();
  useReleaseStaleBodyScroll();
  useEffect(() => {
    captureReferralCodeFromSearch(location.search);
    captureAffiliateCodeFromSearch(location.search);
  }, [location.search]);
  return null;
}

function AppRoutes() {
  useEffect(() => {
    clearStaleChunkReloadFlag();
  }, []);

  return (
    <AppErrorBoundary>
      <AppIntroProvider>
        <BrowserRouter>
          <CaptureAttributionCodes />
          <PlausiblePageviews />
          <CartProvider>
            <WishlistProvider>
              <main className="app-main">
                <Routes>{renderAppShellRoutes()}</Routes>
              </main>
              <CookieNoticeHost />
              <AppIntroSplash />
            </WishlistProvider>
          </CartProvider>
        </BrowserRouter>
      </AppIntroProvider>
    </AppErrorBoundary>
  );
}

function App() {
  return (
    <AppQueryProvider>
      <AppRoutes />
    </AppQueryProvider>
  );
}

export default App;
