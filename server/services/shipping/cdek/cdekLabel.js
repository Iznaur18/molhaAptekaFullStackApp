import { AppError } from "../../../errors/AppError.js";
import { logServerEvent } from "../../../utils/logServerEvent.js";

import { cdekDownload, cdekRequest } from "./cdekClient.js";
import { resolveSellerCdekCredentials } from "./cdekSellerCredentials.js";
import { loadSellerOrder } from "./cdekWaybill.js";

/**
 * Этикетка СДЭК (штрихкод места) для наклейки на коробку.
 *
 * СДЭК собирает PDF асинхронно: заказываем печать, ждём READY и качаем файл.
 * Обычно это пара секунд, поэтому ждём прямо в запросе продавца.
 */

const LABEL_POLL_ATTEMPTS = 8;
const LABEL_POLL_DELAY_MS = 1000;

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {unknown} payload ответ `GET /v2/print/barcodes/{uuid}`
 * @returns {{ ready: boolean; failed: boolean; url: string | null }}
 */
export function readCdekPrintState(payload) {
  const entity = /** @type {Record<string, any>} */ (payload)?.entity ?? {};
  const codes = (Array.isArray(entity.statuses) ? entity.statuses : []).map((row) =>
    String(row?.code ?? ""),
  );
  const url = entity.url ? String(entity.url) : null;
  return {
    ready: Boolean(url) || codes.includes("READY"),
    failed: codes.includes("INVALID") || codes.includes("REMOVED"),
    url,
  };
}

/**
 * @param {{ orderId: string; sellerId: string; sleepFn?: (ms: number) => Promise<unknown> }} params
 * @returns {Promise<{ pdf: Buffer; fileName: string }>}
 */
export async function getCdekLabelPdf({ orderId, sellerId, sleepFn = sleep }) {
  const { shipment } = await loadSellerOrder({ orderId, sellerId });
  const waybill = shipment.cdekWaybill;
  if (!waybill?.uuid || !waybill.cdekNumber) {
    throw new AppError(409, "Этикетка появится, когда СДЭК присвоит номер накладной");
  }
  if (waybill.cancelledAt) {
    throw new AppError(409, "Накладная отменена — этикетка не нужна");
  }

  const credentials = await resolveSellerCdekCredentials(sellerId);
  const created = await cdekRequest(credentials, {
    method: "POST",
    path: "/print/barcodes",
    body: {
      orders: [{ order_uuid: waybill.uuid }],
      copy_count: 1,
      format: "A6",
      lang: "RUS",
    },
  });
  const printUuid = /** @type {any} */ (created)?.entity?.uuid;
  if (!printUuid) {
    throw new AppError(502, "СДЭК не принял запрос на печать — попробуйте ещё раз");
  }

  for (let attempt = 0; attempt < LABEL_POLL_ATTEMPTS; attempt += 1) {
    const state = readCdekPrintState(
      await cdekRequest(credentials, { path: `/print/barcodes/${printUuid}` }),
    );
    if (state.failed) {
      throw new AppError(502, "СДЭК не смог подготовить этикетку");
    }
    if (state.ready && state.url) {
      const pdf = await cdekDownload(credentials, state.url);
      logServerEvent("cdek.label_downloaded", { orderId: String(orderId) });
      return { pdf, fileName: `cdek-${waybill.cdekNumber}.pdf` };
    }
    await sleepFn(LABEL_POLL_DELAY_MS);
  }
  throw new AppError(504, "СДЭК ещё готовит этикетку — попробуйте через минуту");
}
