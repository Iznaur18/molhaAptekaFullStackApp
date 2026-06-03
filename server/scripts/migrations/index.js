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
import { up as userPremiumExpiresUp } from "./20260603-user-premium-expires.js";
import { up as productLoyaltyPointsPerUnitUp } from "./20260603-product-loyalty-points-per-unit.js";
import { removeTelegramUserFieldsUp } from "./20260604-remove-telegram-user-fields.js";
import { up as userEmailVerifiedUp } from "./20260605-user-email-verified.js";
import { up as productCharacteristicsUp } from "./20260606-product-characteristics.js";

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
  {
    id: "20260603-user-premium-expires",
    description: "Backfill premiumExpiresAt and legacy premium users",
    up: userPremiumExpiresUp,
  },
  {
    id: "20260603-product-loyalty-points-per-unit",
    description: "Product loyaltyPointsPerUnit and order line reserve fields",
    up: productLoyaltyPointsPerUnitUp,
  },
  {
    id: "20260604-remove-telegram-user-fields",
    description: "Remove telegramUserId, telegramUsername, telegramPhotoUrl from users",
    up: removeTelegramUserFieldsUp,
  },
  {
    id: "20260605-user-email-verified",
    description: "Backfill isEmailVerified=true for existing users with email",
    up: userEmailVerifiedUp,
  },
  {
    id: "20260606-product-characteristics",
    description: "Backfill productCharacteristics=[] for existing products",
    up: productCharacteristicsUp,
  },
];
