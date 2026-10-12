import { createdPaymentDataSchema, paymentConfigDataSchema } from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { PAYMENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

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
