import { Navigate, Route } from "react-router-dom";

import { HOME_MAIN_VIEW_PATH } from "../../shared/lib/homeMainViewPaths.js";
import { lazyNamedExport } from "../../shared/lib/lazyNamedExport.js";

import { AppShellRoot } from "../ui/AppShellRoot.jsx";

import { CatalogRoutePage } from "./CatalogRoutePage.jsx";

/** Home `/` stays sync; everything else is a separate chunk. */
const LazyCartRoutePage = lazyNamedExport(
  () => import("./CartRoutePage.jsx"),
  "CartRoutePage",
);
const LazySellerProductsRoutePage = lazyNamedExport(
  () => import("./SellerProductsRoutePage.jsx"),
  "SellerProductsRoutePage",
);
const LazyRaffleProductsRoutePage = lazyNamedExport(
  () => import("./RaffleProductsRoutePage.jsx"),
  "RaffleProductsRoutePage",
);
const LazyProductRoutePage = lazyNamedExport(
  () => import("./ProductRoutePage.jsx"),
  "ProductRoutePage",
);
const LazyUserRoutePage = lazyNamedExport(
  () => import("./UserRoutePage.jsx"),
  "UserRoutePage",
);
const LazyFaqRoutePage = lazyNamedExport(
  () => import("./FaqRoutePage.jsx"),
  "FaqRoutePage",
);
const LazyLegalRoutePage = lazyNamedExport(
  () => import("./LegalRoutePage.jsx"),
  "LegalRoutePage",
);
const LazyLoginRoutePage = lazyNamedExport(
  () => import("./LoginRoutePage.jsx"),
  "LoginRoutePage",
);
const LazyForgotPasswordRoutePage = lazyNamedExport(
  () => import("./ForgotPasswordRoutePage.jsx"),
  "ForgotPasswordRoutePage",
);
const LazyRegisterRoutePage = lazyNamedExport(
  () => import("./RegisterRoutePage.jsx"),
  "RegisterRoutePage",
);
const LazyMyProductsRoutePage = lazyNamedExport(
  () => import("./MyProductsRoutePage.jsx"),
  "MyProductsRoutePage",
);
const LazyAccountRoutePage = lazyNamedExport(
  () => import("./AccountRoutePage.jsx"),
  "AccountRoutePage",
);

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
      <Route path="/basket" element={<LazyCartRoutePage />} />
      <Route
        path="/product-promotions"
        element={<Navigate to="/moderation-products" replace />}
      />
      <Route path="/seller/:userId" element={<LazySellerProductsRoutePage />} />
      <Route path="/raffle/:raffleId" element={<LazyRaffleProductsRoutePage />} />
      <Route path="/" element={<CatalogRoutePage />} />
      <Route path="/catalog" element={<CatalogRoutePage />} />
      <Route path="/product/:productId" element={<LazyProductRoutePage />} />
      <Route path="/user/:userId" element={<LazyUserRoutePage />} />

      <Route path="/faq" element={<LazyFaqRoutePage />} />
      <Route path="/legal/:kind" element={<LazyLegalRoutePage />} />
      <Route path="/login" element={<LazyLoginRoutePage />} />
      <Route path="/forgot-password" element={<LazyForgotPasswordRoutePage />} />
      <Route path="/register" element={<LazyRegisterRoutePage />} />
      <Route path="/my-products" element={<LazyMyProductsRoutePage />} />
      {ACCOUNT_MAIN_VIEW_ROUTES.map((path) => (
        <Route key={path} path={path} element={<LazyAccountRoutePage />} />
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
