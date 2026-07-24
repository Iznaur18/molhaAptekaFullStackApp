import { useEffect } from "react";
import { BrowserRouter, Routes } from "react-router-dom";

import { AppQueryProvider } from "../shared/api/AppQueryProvider.jsx";
import { ClientAppErrorBoundary } from "../shared/ui/ClientAppErrorBoundary.jsx";
import { CartProvider } from "../entities/cart/model/CartContext.jsx";
import { WishlistProvider } from "../entities/wishlist/model/WishlistContext.jsx";
import { AppIntroProvider } from "../features/app-intro/model/AppIntroContext.jsx";
import { AppIntroSplash } from "../features/app-intro/ui/AppIntroSplash.jsx";
import { captureReferralCodeFromSearch } from "../shared/lib/referralCodeStorage.js";
import { renderAppShellRoutes } from "./routes/appRoutes.jsx";

import "./App.css";

const APP_INTERFACE_ERROR_MESSAGE = "Ошибка интерфейса. Обновите страницу.";

function AppInterfaceErrorFallback() {
  useEffect(() => {
    window.location.replace("/");
  }, []);

  return <p className="app-error-fallback">{APP_INTERFACE_ERROR_MESSAGE}</p>;
}

function CaptureReferralCode() {
  useEffect(() => {
    captureReferralCodeFromSearch();
  }, []);
  return null;
}

function AppRoutes() {
  return (
    <AppIntroProvider>
      <BrowserRouter>
        <CaptureReferralCode />
        <CartProvider>
          <WishlistProvider>
            <main className="app-main">
              <Routes>{renderAppShellRoutes()}</Routes>
            </main>
            <AppIntroSplash />
          </WishlistProvider>
        </CartProvider>
      </BrowserRouter>
    </AppIntroProvider>
  );
}

function App() {
  return (
    <ClientAppErrorBoundary fallback={<AppInterfaceErrorFallback />}>
      <AppQueryProvider>
        <AppRoutes />
      </AppQueryProvider>
    </ClientAppErrorBoundary>
  );
}

export default App;
