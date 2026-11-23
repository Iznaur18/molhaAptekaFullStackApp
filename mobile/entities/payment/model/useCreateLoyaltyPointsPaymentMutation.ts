import { useMutation } from "@tanstack/react-query";

import { createLoyaltyPointsPayment } from "@/entities/payment/api/paymentApi";

export const useCreateLoyaltyPointsPaymentMutation = () =>
  useMutation({ mutationFn: createLoyaltyPointsPayment });