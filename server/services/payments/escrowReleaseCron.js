import {
  ESCROW_RELEASE_BATCH_SIZE,
  ESCROW_RELEASE_REASON_TIMEOUT,
} from "../../constants/escrowConstants.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  findEscrowEntriesDueForRelease,
  markEscrowReleasable,
} from "./escrowLedger.js";

/**
 * Размораживает деньги, по которым вышел срок после вручения.
 *
 * Нужен ровно для того случая, когда всё прошло хорошо: покупатель получил
 * товар, претензий нет, и подтверждать ему нечего — он просто закрыл
 * приложение. Без таймера такая выплата зависла бы навсегда.
 *
 * Каждая запись обрабатывается отдельно: сбой по одному заказу не должен
 * останавливать выплаты по остальным.
 */
export async function processEscrowReleaseCronTasks() {
  const due = await findEscrowEntriesDueForRelease({
    limit: ESCROW_RELEASE_BATCH_SIZE,
  });
  if (due.length === 0) {
    return { released: 0, failed: 0 };
  }

  let released = 0;
  let failed = 0;

  for (const entry of due) {
    try {
      const updated = await markEscrowReleasable({
        orderId: entry.orderId,
        sellerId: entry.sellerId,
        reason: ESCROW_RELEASE_REASON_TIMEOUT,
      });
      // `null` — запись успел забрать кто-то другой: покупатель подтвердил
      // получение в ту же секунду. Это не ошибка, считать её провалом нельзя.
      if (updated) {
        released += 1;
      }
    } catch (error) {
      failed += 1;
      logServerEvent("error", {
        event: "escrow_auto_release_failed",
        orderId: String(entry.orderId),
        sellerId: String(entry.sellerId),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { released, failed };
}
