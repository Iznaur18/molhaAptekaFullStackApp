import { CartProvider } from "./entities/cart/model/CartContext.jsx";
import { HomePage } from "./pages/home/ui/HomePage.jsx";

import "./App.css";

function App() {
  return (
    <CartProvider>
      <main className="app-main">
        <HomePage />
      </main>
    </CartProvider>
  );
}

export default App;
