import {
  ONEC_EXCHANGE_DIRECTION_SYNC,
  ONEC_EXCHANGE_STATUS_ERROR,
  ONEC_EXCHANGE_STATUS_SUCCESS,
  ONEC_SYNC_STATUS_ERROR,
  ONEC_SYNC_STATUS_SUCCESS,
} from "../../constants/onecConstants.js";
import { OneCExchangeLogModel, UserModel } from "../../models/index.js";
import { pushPendingSellerOrders } from "./pushSellerOrders.js";
import { syncSellerNomenclature } from "./syncSellerNomenclature.js";

/**
 * Полный sync одного продавца: номенклатура + заказы.
 * @param {string} sellerId
 * @param {{ triggeredBy?: "cron" | "manual" }} [opts]
 */
export async function runSellerOneCSync(sellerId, opts = {}) {
  const triggeredBy = opts.triggeredBy ?? "manual";

  try {
    const nomenclature = await syncSellerNomenclature(sellerId, { triggeredBy });
    const orders = await pushPendingSellerOrders(sellerId, { triggeredBy });

    const summary = { nomenclature, orders };

    await UserModel.updateOne(
      { _id: sellerId },
      {
        $set: {
          "oneCIntegration.lastSyncAt": new Date(),
          "oneCIntegration.lastSyncStatus": ONEC_SYNC_STATUS_SUCCESS,
          "oneCIntegration.lastSyncError": "",
          "oneCIntegration.lastSyncSummary": summary,
        },
      },
    );

    await OneCExchangeLogModel.create({
      sellerId,
      direction: ONEC_EXCHANGE_DIRECTION_SYNC,
      status: ONEC_EXCHANGE_STATUS_SUCCESS,
      message: "Полный обмен завершён",
      summary,
      triggeredBy,
    });

    return summary;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка обмена с 1С";

    await UserModel.updateOne(
      { _id: sellerId },
      {
        $set: {
          "oneCIntegration.lastSyncAt": new Date(),
          "oneCIntegration.lastSyncStatus": ONEC_SYNC_STATUS_ERROR,
          "oneCIntegration.lastSyncError": message.slice(0, 2000),
        },
      },
    );

    await OneCExchangeLogModel.create({
      sellerId,
      direction: ONEC_EXCHANGE_DIRECTION_SYNC,
      status: ONEC_EXCHANGE_STATUS_ERROR,
      message: message.slice(0, 2000),
      triggeredBy,
    });

    throw error;
  }
}

/**
 * Cron: все продавцы с включённой 1С.
 */
export async function processOneCCronTasks() {
  const sellers = await UserModel.find({
    "oneCIntegration.enabled": true,
    "oneCIntegration.baseUrl": { $exists: true, $ne: "" },
  })
    .select("_id")
    .lean();

  let ok = 0;
  let failed = 0;

  for (const seller of sellers) {
    try {
      await runSellerOneCSync(String(seller._id), { triggeredBy: "cron" });
      ok += 1;
    } catch (error) {
      failed += 1;
      console.error(
        `[onec] cron sync failed for seller ${seller._id}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  return { sellers: sellers.length, ok, failed };
}
