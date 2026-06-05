import { Navigate, Route } from "react-router-dom";

import { HOME_MAIN_VIEW_PATH } from "../../shared/lib/homeMainViewPaths.js";
import { isStaffStandaloneMainView } from "../../shared/lib/staffMainViews.js";

import { AppShellRoot } from "../ui/AppShellRoot.jsx";
import { StaffLayout } from "../ui/StaffLayout.jsx";

import { AccountRoutePage } from "./AccountRoutePage.jsx";
import { CartRoutePage } from "./CartRoutePage.jsx";
import { CatalogRoutePage } from "./CatalogRoutePage.jsx";
import { MyProductsRoutePage } from "./MyProductsRoutePage.jsx";
import { RaffleProductsRoutePage } from "./RaffleProductsRoutePage.jsx";
import { SellerProductsRoutePage } from "./SellerProductsRoutePage.jsx";
import {
  renderStaffRouteElement,
  STAFF_ROUTE_DEFINITIONS,
} from "./staffRouteConfig.jsx";

/** Пути account mainView без cart, catalog, seller/raffle и staff standalone. */
const ACCOUNT_MAIN_VIEW_ROUTES = Object.entries(HOME_MAIN_VIEW_PATH)
  .filter(
    ([view]) =>
      view !== "cart" &&
      view !== "catalog" &&
      view !== "catalog-browser" &&
      view !== "my-products" &&
      !isStaffStandaloneMainView(view),
  )
  .map(([, path]) => path);

/**
 * @returns {import('react').ReactElement[]}
 */
export function renderAppShellRoutes() {
  return [
    <Route key="shell" element={<AppShellRoot />}>
      <Route path="/basket" element={<CartRoutePage />} />
      <Route path="/seller/:userId" element={<SellerProductsRoutePage />} />
      <Route path="/raffle/:raffleId" element={<RaffleProductsRoutePage />} />
      <Route element={<StaffLayout />}>
        {STAFF_ROUTE_DEFINITIONS.map((definition) => (
          <Route
            key={definition.path}
            path={definition.path}
            element={renderStaffRouteElement(definition)}
          />
        ))}
      </Route>
      <Route path="/" element={<CatalogRoutePage />} />
      <Route path="/catalog" element={<CatalogRoutePage />} />
      <Route path="/my-products" element={<MyProductsRoutePage />} />
      {ACCOUNT_MAIN_VIEW_ROUTES.map((path) => (
        <Route key={path} path={path} element={<AccountRoutePage />} />
      ))}
      <Route path="/users" element={<Navigate to="/user-list" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>,
  ];
}
