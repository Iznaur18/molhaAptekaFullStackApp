export const paymentQueryKeys = {
  all: ["payment"] as const,
  config: () => [...paymentQueryKeys.all, "config"] as const,
  one: (paymentId: string) => [...paymentQueryKeys.all, "one", paymentId] as const,
};
