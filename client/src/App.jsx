import { BrowserRouter, Route, Routes } from "react-router-dom";

import { CartProvider } from "./entities/cart/model/CartContext.jsx";
import { HomePage } from "./pages/home/ui/HomePage.jsx";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <main className="app-main">
          <Routes>
            <Route path="/*" element={<HomePage />} />
          </Routes>
        </main>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
