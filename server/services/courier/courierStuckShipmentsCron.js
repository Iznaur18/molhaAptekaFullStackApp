import { logServerEvent } from "../../utils/logServerEvent.js";
import { findStuckCourierShipments, openShipmentDispute } from "./courierDisputes.js";

/**
 * Поднимает спор по отправлениям, зависшим у курьера дольше суток.
 *
 * Первым срыв замечает продавец — у него кнопка. Таймер нужен на случай, когда
 * продавец не следит: иначе позиция навсегда остаётся в `courier_holding`, а
 * остаток товара — заблокированным без разбирательства.
 *
 * Каждое отправление обрабатываем отдельно: спор по одному заказу не должен
 * ронять проход по остальным.
 */
export async function processCourierStuckShipmentCronTasks() {
  const stuck = await findStuckCourierShipments();
  if (stuck.length === 0) return { opened: 0, failed: 0 };

  let opened = 0;
  let failed = 0;

  for (const shipment of stuck) {
    try {
      await openShipmentDispute({
        orderId: shipment.orderId,
        sellerId: shipment.sellerId,
        reason: "Курьер не выходит на связь дольше суток",
      });
      opened += 1;
    } catch (error) {
      failed += 1;
      logServerEvent("error", {
        event: "courier_stuck_dispute_failed",
        orderId: shipment.orderId,
        sellerId: shipment.sellerId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logServerEvent("info", {
    event: "courier_stuck_shipments_processed",
    found: stuck.length,
    opened,
    failed,
  });

  return { opened, failed };
}
