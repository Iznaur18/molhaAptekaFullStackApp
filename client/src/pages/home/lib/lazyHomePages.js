import { lazyNamedExport } from "../../../shared/lib/lazyNamedExport.js";

export const LazyRaffleProductsPage = lazyNamedExport(
  () => import("../../raffle/ui/RaffleProductsPage.jsx"),
  "RaffleProductsPage",
);

export const LazySellerProductsPage = lazyNamedExport(
  () => import("../../seller-products/ui/SellerProductsPage.jsx"),
  "SellerProductsPage",
);

export const LazyRafflesStaffPage = lazyNamedExport(
  () => import("../../raffles-staff/ui/RafflesStaffPage.jsx"),
  "RafflesStaffPage",
);

export const LazyProductModerationPage = lazyNamedExport(
  () => import("../../product-moderation/ui/ProductModerationPage.jsx"),
  "ProductModerationPage",
);

export const LazyProductReportsPage = lazyNamedExport(
  () => import("../../product-reports/ui/ProductReportsPage.jsx"),
  "ProductReportsPage",
);

export const LazyDataConfirmationRequestsPage = lazyNamedExport(
  () => import("../../data-confirmation-requests/ui/DataConfirmationRequestsPage.jsx"),
  "DataConfirmationRequestsPage",
);

export const LazyInstallmentPaymentsPage = lazyNamedExport(
  () => import("../../installment-payments/ui/InstallmentPaymentsPage.jsx"),
  "InstallmentPaymentsPage",
);

export const LazyInstallmentSalesPage = lazyNamedExport(
  () => import("../../installment-sales/ui/InstallmentSalesPage.jsx"),
  "InstallmentSalesPage",
);

export const LazyInstallmentModerationPage = lazyNamedExport(
  () => import("../../installment-moderation/ui/InstallmentModerationPage.jsx"),
  "InstallmentModerationPage",
);

export const LazyInstallmentDisputesPage = lazyNamedExport(
  () => import("../../installment-disputes/ui/InstallmentDisputesPage.jsx"),
  "InstallmentDisputesPage",
);

export const LazyAuctionPage = lazyNamedExport(
  () => import("../../auction/ui/AuctionPage.jsx"),
  "AuctionPage",
);

export const LazyAdminOrdersPage = lazyNamedExport(
  () => import("../../admin-orders/ui/AdminOrdersPage.jsx"),
  "AdminOrdersPage",
);

export const LazySearchSynonymsAdminPage = lazyNamedExport(
  () => import("../../search-synonyms-admin/ui/SearchSynonymsAdminPage.jsx"),
  "SearchSynonymsAdminPage",
);

export const LazyCategoryTreeAdminPage = lazyNamedExport(
  () => import("../../category-tree-admin/ui/CategoryTreeAdminPage.jsx"),
  "CategoryTreeAdminPage",
);

export const LazyCartPage = lazyNamedExport(
  () => import("../../cart/ui/CartPage.jsx"),
  "CartPage",
);

export const LazyMyOrdersPage = lazyNamedExport(
  () => import("../../my-orders/ui/MyOrdersPage.jsx"),
  "MyOrdersPage",
);

export const LazyMySalesPage = lazyNamedExport(
  () => import("../../my-sales/ui/MySalesPage.jsx"),
  "MySalesPage",
);

export const LazyUsersPage = lazyNamedExport(
  () => import("../../users/ui/UsersPage.jsx"),
  "UsersPage",
);

export const LazySubscriptionsPage = lazyNamedExport(
  () => import("../../subscriptions/ui/SubscriptionsPage.jsx"),
  "SubscriptionsPage",
);

export const LazyNotificationsPage = lazyNamedExport(
  () => import("../../notifications/ui/NotificationsPage.jsx"),
  "NotificationsPage",
);

export const LazyMyProfilePage = lazyNamedExport(
  () => import("../../my-profile/ui/MyProfilePage.jsx"),
  "MyProfilePage",
);

export const LazyDataConfirmationPage = lazyNamedExport(
  () => import("../../data-confirmation/ui/DataConfirmationPage.jsx"),
  "DataConfirmationPage",
);

export const LazyPremiumPage = lazyNamedExport(
  () => import("../../premium/ui/PremiumPage.jsx"),
  "PremiumPage",
);

export const LazyLoyaltyPointsPage = lazyNamedExport(
  () => import("../../loyalty-points/ui/LoyaltyPointsPage.jsx"),
  "LoyaltyPointsPage",
);
