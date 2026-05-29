import { BrowserRouter, Route, Routes } from "react-router-dom";

import { CartProvider } from "./entities/cart/model/CartContext.jsx";
import { AppIntroProvider } from "./features/app-intro/model/AppIntroContext.jsx";
import { AppIntroSplash } from "./features/app-intro/ui/AppIntroSplash.jsx";
import { HomePage } from "./pages/home/ui/HomePage.jsx";

import "./App.css";

function App() {
  return (
    <AppIntroProvider>
      <BrowserRouter>
        <CartProvider>
          <main className="app-main">
            <Routes>
              <Route path="/*" element={<HomePage />} />
            </Routes>
          </main>
          <AppIntroSplash />
        </CartProvider>
      </BrowserRouter>
    </AppIntroProvider>
  );
}

export default App;
