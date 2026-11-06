import {
  yandexDeliveryAvailabilityDataSchema,
  yandexDeliveryPointsDataSchema,
  yandexDeliveryQuoteDataSchema,
} from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

/**
 * Яндекс Доставка в оформлении заказа: доступность у продавца, пункты выдачи
 * и цена. Цена здесь только для показа — при оформлении сервер пересчитает.
 */

/** `GET /order/yandex-delivery-availability` — что из Яндекса предлагает продавец. */
export const fetchYandexDeliveryAvailability = async (sellerId: string) => {
  try {
    const { data } = await apiClient.get("/order/yandex-delivery-availability", {
      params: { sellerId },
    });
    return parseApiContractData(data, yandexDeliveryAvailabilityDataSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, CHECKOUT_FORM_UI.YANDEX_UNAVAILABLE));
  }
};

/** `GET /order/yandex-delivery-points` — пункты выдачи в городе покупателя. */
export const fetchYandexDeliveryPoints = async ({
  sellerId,
  city,
}: {
  sellerId: string;
  city: string;
}) => {
  try {
    const { data } = await apiClient.get("/order/yandex-delivery-points", {
      params: { sellerId, city },
    });
    return parseApiContractData(data, yandexDeliveryPointsDataSchema).points;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, CHECKOUT_FORM_UI.YANDEX_UNAVAILABLE));
  }
};

/** `POST /order/yandex-delivery-quote` — цена до выбранного пункта. */
export const fetchYandexDeliveryQuote = async ({
  items,
  pickupPointId,
}: {
  items: { productId: string; quantity: number }[];
  pickupPointId: string;
}) => {
  try {
    const { data } = await apiClient.post("/order/yandex-delivery-quote", {
      items,
      pickupPointId,
    });
    return parseApiContractData(data, yandexDeliveryQuoteDataSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, CHECKOUT_FORM_UI.YANDEX_UNAVAILABLE));
  }
};

export type YandexExpressQuote = {
  available: boolean;
  deliverySumRub?: number;
  etaMinutes?: number | null;
};

/**
 * `POST /order/yandex-express-quote` — цена курьера Яндекса до точки покупателя.
 * Только для показа: при оформлении сервер пересчитает сам.
 */
export const fetchYandexExpressQuote = async ({
  items,
  toLat,
  toLon,
}: {
  items: readonly { productId: string; quantity: number }[];
  toLat: number;
  toLon: number;
}): Promise<YandexExpressQuote> => {
  try {
    const { data } = await apiClient.post("/order/yandex-express-quote", {
      items,
      toLat,
      toLon,
    });
    const payload = (data as { data?: YandexExpressQuote } | null)?.data;
    return payload ?? { available: false };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, CHECKOUT_FORM_UI.YANDEX_UNAVAILABLE));
  }
};
