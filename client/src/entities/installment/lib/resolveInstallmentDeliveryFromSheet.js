import { ORDER_FULFILLMENT_PICKUP } from "@molha/api-contract";

/**
 * Checkout sheet → тело createInstallmentContract.
 * Самовывоз: адрес точки товара пишется в deliveryAddress (API пока без fulfillmentMethod).
 *
 * @param {{
 *   fulfillmentMethod: string;
 *   deliveryAddress: string;
 *   deliveryAddressFlat: string;
 *   paymentMethod: string;
 * }} sheetPayload
 * @param {{ productPickupAddress?: string | null }} product
 * @returns {{
 *   deliveryAddress: string;
 *   deliveryAddressFlat: string;
 *   paymentMethod: string;
 * }}
 */
export function resolveInstallmentDeliveryFromSheet(sheetPayload, product) {
  if (sheetPayload.fulfillmentMethod === ORDER_FULFILLMENT_PICKUP) {
    return {
      deliveryAddress: String(product?.productPickupAddress ?? "").trim(),
      deliveryAddressFlat: "",
      paymentMethod: sheetPayload.paymentMethod,
    };
  }
  return {
    deliveryAddress: String(sheetPayload.deliveryAddress ?? "").trim(),
    deliveryAddressFlat: String(sheetPayload.deliveryAddressFlat ?? "").trim(),
    paymentMethod: sheetPayload.paymentMethod,
  };
}
