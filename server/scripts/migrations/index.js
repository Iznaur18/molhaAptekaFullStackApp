import { up as backfillOrderItemsStatusUp } from "./20260508-order-items-status.js";
import { up as productImageUrlsUp } from "./20260513-product-image-urls.js";
import { up as userRolePharmacistToModeratorUp } from "./20260516-user-role-pharmacist-to-moderator.js";
import { up as productModerationUp } from "./20260520-product-moderation.js";
import { up as userDataConfirmedUp } from "./20260523-user-data-confirmed.js";
import { up as orderLineProductNameUp } from "./20260525-order-line-product-name.js";
import { up as orderLineLoyaltyPointsUp } from "./20260526-order-line-loyalty-points.js";
import { up as productAuctionUp } from "./20260527-product-auction.js";
import { up as adminCatalogProductsUp } from "./20260528-admin-catalog-products.js";
import { up as productStockQuantityUp } from "./20260529-product-stock-quantity.js";
import { up as raffleSalesConfirmedOnlyUp } from "./20260530-raffle-sales-confirmed-only.js";
import { up as userPhoneNumberUnsetNullUp } from "./20260531-user-phone-number-unset-null.js";

export const MIGRATIONS = [
  {
    id: "20260508-order-items-status",
    description: "Backfill item-level status/audit fields in orders",
    up: backfillOrderItemsStatusUp,
  },
  {
    id: "20260513-product-image-urls",
    description: "Migrate productImageUrl to productImageUrls array",
    up: productImageUrlsUp,
  },
  {
    id: "20260516-user-role-pharmacist-to-moderator",
    description: "Rename userRole pharmacist → moderator",
    up: userRolePharmacistToModeratorUp,
  },
  {
    id: "20260520-product-moderation",
    description: "Backfill productModerationStatus for existing products",
    up: productModerationUp,
  },
  {
    id: "20260523-user-data-confirmed",
    description: "Backfill isUserDataConfirmed=false for existing users",
    up: userDataConfirmedUp,
  },
  {
    id: "20260525-order-line-product-name",
    description: "Backfill productNameAtOrder on order line items",
    up: orderLineProductNameUp,
  },
  {
    id: "20260526-order-line-loyalty-points",
    description: "Backfill loyaltyPointsAwarded/Earned on order line items",
    up: orderLineLoyaltyPointsUp,
  },
  {
    id: "20260527-product-auction",
    description: "Backfill productAuctionEnabled and productAuctionCompletedOnce",
    up: productAuctionUp,
  },
  {
    id: "20260528-admin-catalog-products",
    description: "List admin seller products in public catalog",
    up: adminCatalogProductsUp,
  },
  {
    id: "20260529-product-stock-quantity",
    description: "Backfill productStockQuantity for existing products",
    up: productStockQuantityUp,
  },
  {
    id: "20260530-raffle-sales-confirmed-only",
    description: "Recalculate active raffle salesProgress (confirmed sales only)",
    up: raffleSalesConfirmedOnlyUp,
  },
  {
    id: "20260531-user-phone-number-unset-null",
    description: "Remove null/empty userPhoneNumber (sparse unique index safe)",
    up: userPhoneNumberUnsetNullUp,
  },
];
