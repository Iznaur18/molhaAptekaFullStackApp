import {
  ONEC_EXCHANGE_DIRECTION_SYNC,
  ONEC_EXCHANGE_STATUS_ERROR,
  ONEC_EXCHANGE_STATUS_SUCCESS,
  ONEC_SYNC_STATUS_ERROR,
  ONEC_SYNC_STATUS_SUCCESS,
} from "../../constants/onecConstants.js";
import { AppError } from "../../errors/AppError.js";
import { OneCExchangeLogModel, UserModel } from "../../models/index.js";
import { formatLogError, logServerEvent } from "../../utils/logServerEvent.js";
import { ONEC_CHANNEL_PULL } from "../../constants/onecExchangeConstants.js";
import { purgeExpiredOneCExchangeDirs } from "./exchange/onecExchangeSession.js";
import { resumeStalledOneCImportJobs } from "./exchange/processOneCImportJob.js";
import { pushPendingSellerOrders } from "./pushSellerOrders.js";
import { syncSellerNomenclature } from "./syncSellerNomenclature.js";

/**
 * Полный sync одного продавца: номенклатура + заказы.
 * @param {string} sellerId
 * @param {{ triggeredBy?: "cron" | "manual" }} [opts]
 */
export async function runSellerOneCSync(sellerId, opts = {}) {
  const triggeredBy = opts.triggeredBy ?? "manual";

  await assertSellerUsesPullChannel(sellerId);

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
 * Инициатива обмена принадлежит одной стороне: в `pull` ходит сайт, в
 * `commerceml` — сама 1С. Дёргать `runSellerOneCSync` во втором случае нечем
 * и незачем, поэтому отсекаем это явной ошибкой, а не пустым результатом.
 *
 * @param {string} sellerId
 */
async function assertSellerUsesPullChannel(sellerId) {
  const user = await UserModel.findById(sellerId)
    .select("oneCIntegration.channel")
    .lean();
  const channel = user?.oneCIntegration?.channel ?? ONEC_CHANNEL_PULL;
  if (channel !== ONEC_CHANNEL_PULL) {
    throw new AppError(
      400,
      "У вас включён обмен CommerceML: выгрузку запускает сама 1С, кнопкой на сайте её не вызвать",
    );
  }
}

/**
 * Cron: все продавцы с включённой 1С по каналу `pull`.
 */
export async function processOneCCronTasks() {
  const housekeeping = await runOneCExchangeHousekeeping();

  const sellers = await UserModel.find({
    "oneCIntegration.enabled": true,
    "oneCIntegration.baseUrl": { $exists: true, $ne: "" },
    $or: [
      { "oneCIntegration.channel": ONEC_CHANNEL_PULL },
      { "oneCIntegration.channel": { $exists: false } },
    ],
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
      logServerEvent("error", {
        event: "onec.cron_seller_sync_failed",
        sellerId: String(seller._id),
        ...formatLogError(error),
      });
    }
  }

  return { sellers: sellers.length, ok, failed, ...housekeeping };
}

/**
 * Обслуживание CommerceML-канала: подчистить брошенные временные папки и
 * дозапустить разбор, не переживший рестарт процесса.
 */
async function runOneCExchangeHousekeeping() {
  const result = { purgedDirs: 0, resumedImports: 0 };

  try {
    const purged = await purgeExpiredOneCExchangeDirs();
    result.purgedDirs = purged.removed;
  } catch (error) {
    logServerEvent("warn", {
      event: "onec.exchange_housekeeping_purge_failed",
      ...formatLogError(error),
    });
  }

  try {
    const resumed = await resumeStalledOneCImportJobs();
    result.resumedImports = resumed.restarted;
  } catch (error) {
    logServerEvent("warn", {
      event: "onec.exchange_housekeeping_resume_failed",
      ...formatLogError(error),
    });
  }

  return result;
}
