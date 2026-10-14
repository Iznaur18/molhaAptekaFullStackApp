import {
  cdekAvailabilityDataSchema,
  cdekDeliveryPointsDataSchema,
  cdekQuoteDataSchema,
} from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

/**
 * СДЭК в оформлении заказа: доступность у продавца, пункты выдачи и тарифы.
 * Цена здесь — только для показа: при оформлении сервер пересчитает её сам.
 */

/** `GET /order/cdek-availability` — подключил ли продавец свой договор СДЭК. */
export const fetchCdekAvailability = async (sellerId: string): Promise<boolean> => {
  try {
    const { data } = await apiClient.get("/order/cdek-availability", {
      params: { sellerId },
    });
    return parseApiContractData(data, cdekAvailabilityDataSchema).available === true;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, CHECKOUT_FORM_UI.CDEK_UNAVAILABLE));
  }
};

/** `GET /order/cdek-delivery-points` — пункты выдачи в городе покупателя. */
export const fetchCdekDeliveryPoints = async ({
  sellerId,
  city,
}: {
  sellerId: string;
  city: string;
}) => {
  try {
    const { data } = await apiClient.get("/order/cdek-delivery-points", {
      params: { sellerId, city },
    });
    return parseApiContractData(data, cdekDeliveryPointsDataSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, CHECKOUT_FORM_UI.CDEK_UNAVAILABLE));
  }
};

/** `POST /order/cdek-quote` — тарифы СДЭК до города покупателя. */
export const fetchCdekQuote = async ({
  productIds,
  toCityCode,
}: {
  productIds: string[];
  toCityCode: number;
}) => {
  try {
    const { data } = await apiClient.post("/order/cdek-quote", {
      productIds,
      toCityCode,
    });
    return parseApiContractData(data, cdekQuoteDataSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, CHECKOUT_FORM_UI.CDEK_UNAVAILABLE));
  }
};
