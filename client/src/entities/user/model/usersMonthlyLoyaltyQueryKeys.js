export const usersMonthlyLoyaltyQueryKeys = {
  all: /** @type {const} */ (["users-monthly-loyalty"]),
  monthlyAwarded: () =>
    /** @type {const} */ ([...usersMonthlyLoyaltyQueryKeys.all, "monthly-awarded"]),
};
