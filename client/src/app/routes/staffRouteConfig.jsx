import { HOME_MAIN_VIEW_PATH } from "../../shared/lib/homeMainViewPaths.js";

import { StaffRouteGuard } from "./guards/StaffRouteGuard.jsx";
import { AdminOrdersRoutePage } from "./staff/AdminOrdersRoutePage.jsx";
import { CategoryTreeAdminRoutePage } from "./staff/CategoryTreeAdminRoutePage.jsx";
import { DataConfirmationRequestsRoutePage } from "./staff/DataConfirmationRequestsRoutePage.jsx";
import { InstallmentDisputesRoutePage } from "./staff/InstallmentDisputesRoutePage.jsx";
import { InstallmentModerationRoutePage } from "./staff/InstallmentModerationRoutePage.jsx";
import { ProductModerationRoutePage } from "./staff/ProductModerationRoutePage.jsx";
import { ProductPromotionsRoutePage } from "./staff/ProductPromotionsRoutePage.jsx";
import { ProductReportsRoutePage } from "./staff/ProductReportsRoutePage.jsx";
import { SearchSynonymsAdminRoutePage } from "./staff/SearchSynonymsAdminRoutePage.jsx";
import { StaffRafflesRoutePage } from "./staff/StaffRafflesRoutePage.jsx";

/**
 * @typedef {{
 *   path: string;
 *   requireAdmin: boolean;
 *   requireModerator: boolean;
 *   Page: () => import('react').JSX.Element;
 * }} StaffRouteDefinition
 */

/** @type {StaffRouteDefinition[]} */
export const STAFF_ROUTE_DEFINITIONS = [
  {
    path: HOME_MAIN_VIEW_PATH["admin-orders"],
    requireAdmin: true,
    requireModerator: false,
    Page: AdminOrdersRoutePage,
  },
  {
    path: HOME_MAIN_VIEW_PATH["search-synonyms-admin"],
    requireAdmin: true,
    requireModerator: false,
    Page: SearchSynonymsAdminRoutePage,
  },
  {
    path: HOME_MAIN_VIEW_PATH["category-tree-admin"],
    requireAdmin: true,
    requireModerator: false,
    Page: CategoryTreeAdminRoutePage,
  },
  {
    path: HOME_MAIN_VIEW_PATH["product-moderation"],
    requireAdmin: false,
    requireModerator: true,
    Page: ProductModerationRoutePage,
  },
  {
    path: HOME_MAIN_VIEW_PATH["product-reports"],
    requireAdmin: false,
    requireModerator: true,
    Page: ProductReportsRoutePage,
  },
  {
    path: HOME_MAIN_VIEW_PATH["product-promotions"],
    requireAdmin: false,
    requireModerator: true,
    Page: ProductPromotionsRoutePage,
  },
  {
    path: HOME_MAIN_VIEW_PATH["staff-raffles"],
    requireAdmin: false,
    requireModerator: true,
    Page: StaffRafflesRoutePage,
  },
  {
    path: HOME_MAIN_VIEW_PATH["data-confirmation-requests"],
    requireAdmin: false,
    requireModerator: true,
    Page: DataConfirmationRequestsRoutePage,
  },
  {
    path: HOME_MAIN_VIEW_PATH["installment-moderation"],
    requireAdmin: false,
    requireModerator: true,
    Page: InstallmentModerationRoutePage,
  },
  {
    path: HOME_MAIN_VIEW_PATH["installment-disputes"],
    requireAdmin: false,
    requireModerator: true,
    Page: InstallmentDisputesRoutePage,
  },
];

/**
 * @param {StaffRouteDefinition} definition
 */
export function renderStaffRouteElement({ requireAdmin, requireModerator, Page }) {
  return (
    <StaffRouteGuard requireAdmin={requireAdmin} requireModerator={requireModerator}>
      <Page />
    </StaffRouteGuard>
  );
}
