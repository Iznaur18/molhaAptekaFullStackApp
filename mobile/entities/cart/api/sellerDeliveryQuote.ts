import { sellerDeliveryQuoteDataSchema } from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

/**
 * `POST /order/seller-delivery-quote` — тариф продавца и расстояние по дорогам.
 *
 * Расстояние считает сервер тем же путём, что и заказ: приложение не меряет
 * его само по своей точке, иначе сумма в оформлении и в заказе разошлись бы.
 */
export const fetchSellerDeliveryQuote = async ({
  productIds,
  deliveryAddress,
  deliveryAddressFlat = "",
  deliveryAddressGeo = null,
}: {
  productIds: string[];
  deliveryAddress: string;
  deliveryAddressFlat?: string;
  deliveryAddressGeo?: { lat: number; lon: number } | null;
}) => {
  try {
    const { data } = await apiClient.post("/order/seller-delivery-quote", {
      productIds,
      deliveryAddress,
      deliveryAddressFlat,
      deliveryAddressGeo,
    });
    return parseApiContractData(data, sellerDeliveryQuoteDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, CHECKOUT_FORM_UI.SELLER_DELIVERY_QUOTE_FALLBACK),
    );
  }
};
