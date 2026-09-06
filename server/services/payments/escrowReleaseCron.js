import {
  ESCROW_RELEASE_BATCH_SIZE,
  ESCROW_RELEASE_REASON_TIMEOUT,
} from "../../constants/escrowConstants.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  findEscrowLinesDueForRelease,
  markEscrowLineReleasable,
} from "./escrowLedger.js";

/**
 * Размораживает деньги по позициям, у которых вышел срок после вручения.
 *
 * Нужен ровно для того случая, когда всё прошло хорошо: покупатель получил
 * товар, претензий нет, и подтверждать ему нечего — он просто закрыл
 * приложение. Без таймера такая выплата зависла бы навсегда.
 *
 * Разбор идёт по строкам, а не по отправлениям: у соседних позиций одного
 * продавца сроки свои, и вышедший срок одной не повод трогать остальные.
 * Каждая строка обрабатывается отдельно — сбой по одной не должен
 * останавливать выплаты по другим.
 */
export async function processEscrowReleaseCronTasks() {
  const due = await findEscrowLinesDueForRelease({
    limit: ESCROW_RELEASE_BATCH_SIZE,
  });
  if (due.length === 0) {
    return { released: 0, failed: 0 };
  }

  let released = 0;
  let failed = 0;

  for (const line of due) {
    try {
      const updated = await markEscrowLineReleasable({
        orderId: line.orderId,
        sellerId: line.sellerId,
        itemIndex: line.itemIndex,
        reason: ESCROW_RELEASE_REASON_TIMEOUT,
      });
      // `null` — строку успел забрать кто-то другой: покупатель подтвердил
      // получение в ту же секунду. Это не ошибка, считать её провалом нельзя.
      if (updated) {
        released += 1;
      }
    } catch (error) {
      failed += 1;
      logServerEvent("error", {
        event: "escrow_auto_release_failed",
        orderId: String(line.orderId),
        sellerId: String(line.sellerId),
        itemIndex: line.itemIndex,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { released, failed };
}
