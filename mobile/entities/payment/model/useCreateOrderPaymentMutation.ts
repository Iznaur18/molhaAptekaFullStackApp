import { useMutation } from "@tanstack/react-query";

import { createOrderPayment } from "@/entities/payment/api/paymentApi";

export const useCreateOrderPaymentMutation = () =>
  useMutation({ mutationFn: createOrderPayment });
