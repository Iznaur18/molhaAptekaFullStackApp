import {
  ORDER_FULFILLMENT_DELIVERY,
  ORDER_FULFILLMENT_PICKUP,
} from "@molha/api-contract";

import { apiClient, parseCreateOrderData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { OrderPaymentMethod } from "../model/constants";

export type OrderFulfillmentMethod =
  | typeof ORDER_FULFILLMENT_PICKUP
  | typeof ORDER_FULFILLMENT_DELIVERY;

export type CreateOrderPayload = {
  items: { productId: string; quantity: number }[];
  fulfillmentMethod?: OrderFulfillmentMethod;
  deliveryAddress: string;
  deliveryAddressFlat?: string;
  paymentMethod: OrderPaymentMethod;
  priceOfferId?: string;
  affiliateCode?: string;
  pickupSelections?: Array<{ productId: string; pickupLocationId: string }>;
  idempotencyKey: string;
};

export const createOrder = async (payload: CreateOrderPayload) => {
  try {
    const body: Record<string, unknown> = {
      ...payload,
      deliveryAddressFlat: payload.deliveryAddressFlat ?? "",
    };
    const code = String(payload.affiliateCode ?? "").trim();
    if (!code) {
      delete body.affiliateCode;
    }
    const { data } = await apiClient.post("/order", body);
    const parsed = parseCreateOrderData(data);
    return parsed.order;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.CREATE_ORDER_FALLBACK));
  }
};
