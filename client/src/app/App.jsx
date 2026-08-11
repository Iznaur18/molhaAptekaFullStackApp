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
import { renderAppShellRoutes } from "./routes/appRoutes.jsx";

import "./App.css";

function CaptureAttributionCodes() {
  const location = useLocation();
  useEffect(() => {
    captureReferralCodeFromSearch(location.search);
    captureAffiliateCodeFromSearch(location.search);
  }, [location.search]);
  return null;
}

function AppRoutes() {
  return (
    <AppIntroProvider>
      <BrowserRouter>
        <CaptureAttributionCodes />
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
