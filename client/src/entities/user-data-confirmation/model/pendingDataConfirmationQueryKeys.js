export const pendingDataConfirmationQueryKeys = {
  all: ["user", "data-confirmation", "pending"],
  count: () => [...pendingDataConfirmationQueryKeys.all, "count"],
};
