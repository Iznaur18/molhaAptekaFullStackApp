export const paymentQueryKeys = {
  all: ["payment"] as const,
  config: () => [...paymentQueryKeys.all, "config"] as const,
};
