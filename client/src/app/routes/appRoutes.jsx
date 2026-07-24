import { Navigate, Route } from "react-router-dom";

import { HOME_MAIN_VIEW_PATH } from "../../shared/lib/homeMainViewPaths.js";

import { AppShellRoot } from "../ui/AppShellRoot.jsx";

import { AccountRoutePage } from "./AccountRoutePage.jsx";
import { CartRoutePage } from "./CartRoutePage.jsx";
import { CatalogRoutePage } from "./CatalogRoutePage.jsx";
import { FaqRoutePage } from "./FaqRoutePage.jsx";
import { LegalRoutePage } from "./LegalRoutePage.jsx";
import { LoginRoutePage } from "./LoginRoutePage.jsx";
import { MyProductsRoutePage } from "./MyProductsRoutePage.jsx";
import { ProductRoutePage } from "./ProductRoutePage.jsx";
import { RaffleProductsRoutePage } from "./RaffleProductsRoutePage.jsx";
import { RegisterRoutePage } from "./RegisterRoutePage.jsx";
import { SellerProductsRoutePage } from "./SellerProductsRoutePage.jsx";
import { UserRoutePage } from "./UserRoutePage.jsx";

/** Пути account mainView без cart, catalog, seller/raffle. */
const ACCOUNT_MAIN_VIEW_ROUTES = Object.entries(HOME_MAIN_VIEW_PATH)
  .filter(
    ([view]) =>
      view !== "cart" &&
      view !== "catalog" &&
      view !== "catalog-browser" &&
      view !== "my-products",
  )
  .map(([, path]) => path);

/**
 * @returns {import('react').ReactElement[]}
 */
export function renderAppShellRoutes() {
  return [
    <Route key="shell" element={<AppShellRoot />}>
      <Route path="/basket" element={<CartRoutePage />} />
      <Route
        path="/product-promotions"
        element={<Navigate to="/moderation-products" replace />}
      />
      <Route path="/seller/:userId" element={<SellerProductsRoutePage />} />
      <Route path="/raffle/:raffleId" element={<RaffleProductsRoutePage />} />
      <Route path="/" element={<CatalogRoutePage />} />
      <Route path="/catalog" element={<CatalogRoutePage />} />
      <Route path="/product/:productId" element={<ProductRoutePage />} />
      <Route path="/user/:userId" element={<UserRoutePage />} />

      <Route path="/faq" element={<FaqRoutePage />} />
      <Route path="/legal/:kind" element={<LegalRoutePage />} />
      <Route path="/login" element={<LoginRoutePage />} />
      <Route path="/register" element={<RegisterRoutePage />} />
      <Route path="/my-products" element={<MyProductsRoutePage />} />
      {ACCOUNT_MAIN_VIEW_ROUTES.map((path) => (
        <Route key={path} path={path} element={<AccountRoutePage />} />
      ))}
      <Route path="/users" element={<Navigate to="/user-list" replace />} />
      <Route
        path="/product-manage-toggle-display-admin"
        element={<Navigate to="/site-header-banner-admin" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>,
  ];
}
