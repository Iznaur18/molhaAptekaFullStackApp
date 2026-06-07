import { BrowserRouter, Routes } from "react-router-dom";

import { AppQueryProvider } from "./shared/api/AppQueryProvider.jsx";
import { Sentry } from "./shared/lib/initClientSentry.js";
import { CartProvider } from "./entities/cart/model/CartContext.jsx";
import { AppIntroProvider } from "./features/app-intro/model/AppIntroContext.jsx";
import { AppIntroSplash } from "./features/app-intro/ui/AppIntroSplash.jsx";
import { renderAppShellRoutes } from "./app/routes/appRoutes.jsx";

import "./App.css";

function AppRoutes() {
  return (
    <AppIntroProvider>
      <BrowserRouter>
        <CartProvider>
          <main className="app-main">
            <Routes>{renderAppShellRoutes()}</Routes>
          </main>
          <AppIntroSplash />
        </CartProvider>
      </BrowserRouter>
    </AppIntroProvider>
  );
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<p className="app-error-fallback">Ошибка интерфейса. Обновите страницу.</p>}>
      <AppQueryProvider>
        <AppRoutes />
      </AppQueryProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;
