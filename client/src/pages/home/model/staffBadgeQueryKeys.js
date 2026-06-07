import { installmentQueryKeys } from "../../../entities/installment/model/installmentQueryKeys.js";
import { moderationQueryKeys } from "../../../entities/product/model/moderationQueryKeys.js";
import { pendingDataConfirmationQueryKeys } from "../../../entities/user-data-confirmation/model/pendingDataConfirmationQueryKeys.js";
import { raffleQueryKeys } from "../../../entities/raffle/model/raffleQueryKeys.js";

/** Composite keys for badges backed by multiple count APIs. */
const COMPOSITE_STAFF_BADGE_KEYS = {
  productReports: ["staff-badge", "product-reports"],
  userProfileActions: ["user", "profile", "action-badges"],
};

export const staffBadgeQueryKeys = {
  moderation: moderationQueryKeys.count(),
  productReports: COMPOSITE_STAFF_BADGE_KEYS.productReports,
  dataConfirmation: pendingDataConfirmationQueryKeys.count(),
  raffles: raffleQueryKeys.staffPendingCount(),
  installmentModeration: installmentQueryKeys.moderationPendingCount(),
  installmentDisputes: installmentQueryKeys.disputesPendingCount(),
  userProfileActions: COMPOSITE_STAFF_BADGE_KEYS.userProfileActions,
};
