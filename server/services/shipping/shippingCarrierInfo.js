import {
  SHIPPING_CARRIER_INFO_FIELDS,
  SHIPPING_CARRIER_INFO_IDS,
  SHIPPING_CARRIER_INFO_LABEL_RU,
  hasShippingCarrierInfo,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";
import { ShippingCarrierInfoModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

/**
 * Строка справки в форме ответа: все поля — строки, пустое поле — "".
 *
 * @param {string} carrierId
 * @param {Record<string, unknown> | null | undefined} stored
 */
export function buildShippingCarrierInfoRow(carrierId, stored) {
  return {
    carrierId,
    label: SHIPPING_CARRIER_INFO_LABEL_RU[carrierId] ?? carrierId,
    ...Object.fromEntries(
      SHIPPING_CARRIER_INFO_FIELDS.map((field) => [
        field,
        String(stored?.[field] ?? "").trim(),
      ]),
    ),
  };
}

/**
 * Справки по службам доставки.
 *
 * @param {{ includeEmpty?: boolean }} [params] `includeEmpty` — для админки:
 *   показать и незаполненные службы. Покупателю пустые не отдаём — у них нет
 *   кнопки «!».
 */
export async function listShippingCarrierInfo({ includeEmpty = false } = {}) {
  const rows = await ShippingCarrierInfoModel.find({
    carrierId: { $in: SHIPPING_CARRIER_INFO_IDS },
  }).lean();
  const byId = new Map(rows.map((row) => [row.carrierId, row]));

  const items = SHIPPING_CARRIER_INFO_IDS.map((carrierId) =>
    buildShippingCarrierInfoRow(carrierId, byId.get(carrierId)),
  );
  return includeEmpty ? items : items.filter((item) => hasShippingCarrierInfo(item));
}

/**
 * Сохранить справку службы целиком (пустая строка стирает поле).
 *
 * @param {{
 *   carrierId: string;
 *   info: Record<string, string>;
 *   adminId: string;
 * }} input
 */
export async function saveShippingCarrierInfo({ carrierId, info, adminId }) {
  if (!SHIPPING_CARRIER_INFO_IDS.includes(carrierId)) {
    throw new AppError(400, `Неизвестная служба доставки: ${carrierId}`);
  }

  const fields = Object.fromEntries(
    SHIPPING_CARRIER_INFO_FIELDS.map((field) => [
      field,
      String(info?.[field] ?? "").trim(),
    ]),
  );

  await ShippingCarrierInfoModel.updateOne(
    { carrierId },
    { $set: { ...fields, updatedBy: adminId } },
    { upsert: true },
  );

  logServerEvent("info", {
    event: "shipping_carrier_info_saved",
    carrierId,
    adminId: String(adminId),
  });

  return listShippingCarrierInfo({ includeEmpty: true });
}
