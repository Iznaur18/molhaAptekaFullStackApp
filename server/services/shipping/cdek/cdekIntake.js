import {
  CDEK_DELIVERY_MODE_POINT_TO_POINT,
  CDEK_INTAKE_EXISTS_MESSAGE,
  validateCdekIntakeWindow,
} from "@molha/api-contract";

import { AppError } from "../../../errors/AppError.js";
import { UserModel } from "../../../models/index.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

import { cdekRequest } from "./cdekClient.js";
import { resolveSellerCdekCredentials } from "./cdekSellerCredentials.js";
import { loadSellerOrder, readCdekOrderState, saveWaybill } from "./cdekWaybill.js";

/**
 * Вызов курьера СДЭК к продавцу — для тарифов «от двери». Без заявки курьер
 * не приедет: накладная сама по себе забор не заказывает.
 */

/** Сегодня по Москве: СДЭК и продавцы живут по ней, сервер — в UTC. */
export function resolveMoscowToday(now = new Date()) {
  return new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * @param {{
 *   orderId: string;
 *   sellerId: string;
 *   intakeDate: string;
 *   timeFrom: string;
 *   timeTo: string;
 *   phone: string;
 *   comment?: string;
 *   today?: string;
 * }} params
 */
export async function createCdekIntake({
  orderId,
  sellerId,
  intakeDate,
  timeFrom,
  timeTo,
  phone,
  comment = "",
  today = resolveMoscowToday(),
}) {
  const { shipment } = await loadSellerOrder({ orderId, sellerId });
  const waybill = shipment.cdekWaybill;
  if (!waybill?.uuid || waybill.cancelledAt) {
    throw new AppError(409, "Сначала создайте накладную СДЭК");
  }
  if (
    shipment.cdekShipmentAtOrder?.deliveryMode === CDEK_DELIVERY_MODE_POINT_TO_POINT
  ) {
    throw new AppError(409, "По этому тарифу посылку вы сдаёте в пункт сами");
  }
  if (waybill.intake?.uuid) {
    throw new AppError(409, CDEK_INTAKE_EXISTS_MESSAGE);
  }
  const windowError = validateCdekIntakeWindow({ intakeDate, timeFrom, timeTo }, today);
  if (windowError) {
    throw new AppError(400, windowError);
  }

  const seller = await UserModel.findById(sellerId).select("userName").lean();
  const credentials = await resolveSellerCdekCredentials(sellerId);
  const created = await cdekRequest(credentials, {
    method: "POST",
    path: "/intakes",
    body: {
      order_uuid: waybill.uuid,
      intake_date: intakeDate,
      intake_time_from: timeFrom,
      intake_time_to: timeTo,
      need_call: false,
      ...(comment ? { comment } : {}),
      sender: {
        name: String(seller?.userName ?? "").trim() || "Продавец",
        phones: [{ number: phone }],
      },
    },
  });
  const uuid = /** @type {any} */ (created)?.entity?.uuid;
  if (!uuid) {
    throw new AppError(502, "СДЭК не принял заявку на курьера — попробуйте ещё раз");
  }

  const next = {
    ...waybill,
    intake: {
      uuid: String(uuid),
      date: intakeDate,
      timeFrom,
      timeTo,
      status: null,
      statusCode: null,
      error: null,
      createdAt: new Date(),
    },
  };
  await saveWaybill(orderId, sellerId, next);
  logServerEvent("cdek.intake_created", {
    orderId: String(orderId),
    uuid: String(uuid),
  });

  return refreshCdekIntake({ orderId, sellerId, waybill: next, credentials });
}

/**
 * Статус заявки на курьера. Вызывается из обновления накладной.
 *
 * @param {{
 *   orderId: string;
 *   sellerId: string;
 *   waybill: Record<string, any>;
 *   credentials: { account: string; secure: string; environment?: string };
 * }} params
 */
export async function refreshCdekIntake({ orderId, sellerId, waybill, credentials }) {
  const intake = waybill.intake;
  if (!intake?.uuid) return waybill;
  const payload = await cdekRequest(credentials, { path: `/intakes/${intake.uuid}` });
  const state = readCdekOrderState(payload);
  const next = {
    ...waybill,
    intake: {
      ...intake,
      status: state.status ?? intake.status ?? null,
      statusCode: state.statusCode ?? intake.statusCode ?? null,
      error: state.error,
    },
  };
  await saveWaybill(orderId, sellerId, next);
  return next;
}
