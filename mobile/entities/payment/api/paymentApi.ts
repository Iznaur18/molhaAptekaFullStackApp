import {
  PAYMENT_STATUS_CANCELED,
  PAYMENT_STATUS_CREATED,
  PAYMENT_STATUS_SUCCEEDED,
  createdPaymentDataSchema,
  paymentConfigDataSchema,
} from "@molha/api-contract";
import { z } from "zod";

import { apiClient, parseApiContractData } from "@/shared/api";
import { PAYMENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

const myPaymentDataSchema = z.object({
  payment: z
    .object({
      paymentId: z.string(),
      status: z.enum([
        PAYMENT_STATUS_CREATED,
        PAYMENT_STATUS_SUCCEEDED,
        PAYMENT_STATUS_CANCELED,
      ]),
      amountRub: z.number(),
      creditedPoints: z.number().optional(),
    })
    .passthrough()
    .nullable(),
});

export type MyPaymentRecord = NonNullable<
  z.infer<typeof myPaymentDataSchema>["payment"]
>;

/** `GET /payments/config` — что площадка умеет принимать. */
export const fetchPaymentConfig = async () => {
  try {
    const { data } = await apiClient.get("/payments/config");
    return parseApiContractData(data, paymentConfigDataSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, PAYMENT_UI.CONFIG_FALLBACK));
  }
};

/**
 * `POST /payments/order/:orderId` — счёт на предоплату заказа по СБП.
 *
 * Сумму сервер считает сам по заказу. `returnUrl` — путь на сайте: ЮKassa
 * возвращает покупателя на gitorg.ru, а ссылку на этот домен открывает
 * приложение.
 */
export const createOrderPayment = async ({
  orderId,
  returnUrl,
}: {
  orderId: string;
  returnUrl: string;
}) => {
  try {
    const { data } = await apiClient.post(`/payments/order/${orderId}`, { returnUrl });
    return parseApiContractData(data, createdPaymentDataSchema).payment;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, PAYMENT_UI.CREATE_FALLBACK));
  }
};

/**
 * `POST /payments/loyalty-points` — счёт на пополнение баллов.
 *
 * `returnUrl` — путь на сайте: после оплаты deep link откроет приложение.
 */
export const createLoyaltyPointsPayment = async ({
  amountRub,
  returnUrl,
  idempotencyKey,
}: {
  amountRub: number;
  returnUrl: string;
  idempotencyKey?: string;
}) => {
  try {
    const { data } = await apiClient.post("/payments/loyalty-points", {
      amountRub,
      returnUrl,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    });
    return parseApiContractData(data, createdPaymentDataSchema).payment;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, PAYMENT_UI.CREATE_FALLBACK));
  }
};

/** `GET /payments/:paymentId` — свой платёж после возврата с оплаты. */
export const fetchMyPayment = async (
  paymentId: string,
): Promise<MyPaymentRecord | null> => {
  try {
    const { data } = await apiClient.get(`/payments/${paymentId}`);
    const parsed = parseApiContractData(data, myPaymentDataSchema);
    return parsed.payment ?? null;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, PAYMENT_UI.CREATE_FALLBACK));
  }
};
