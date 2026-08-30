import {
  ONEC_EXCHANGE_DIRECTION_COMMERCEML,
  ONEC_EXCHANGE_STATUS_ERROR,
  ONEC_EXCHANGE_STATUS_SUCCESS,
  ONEC_SYNC_STATUS_ERROR,
  ONEC_SYNC_STATUS_SUCCESS,
} from "../../../constants/onecConstants.js";
import {
  ONEC_IMPORT_KIND_CATALOG,
  ONEC_IMPORT_KIND_OFFERS,
  ONEC_IMPORT_STATUS_COMPLETED,
  ONEC_IMPORT_STATUS_FAILED,
  ONEC_IMPORT_STATUS_PENDING,
  ONEC_IMPORT_STATUS_PROCESSING,
} from "../../../constants/onecExchangeConstants.js";
import {
  OneCCategoryMappingModel,
  OneCExchangeLogModel,
  OneCImportJobModel,
  ProductModel,
  UserModel,
} from "../../../models/index.js";
import { formatLogError, logServerEvent } from "../../../utils/logServerEvent.js";
import { resolveSellerDefaultPickupFromUser } from "../../product/bulkImport/resolveSellerDefaultPickupFromUser.js";
import { resolveProductPickupWriteFields } from "../../product/productPickupLocations.js";
import { applyProductSaleCityFields } from "../../product/ruCityNormalized.js";
import {
  createArchiveImageResolver,
  createOneCCatalogApplier,
} from "./applyOneCCatalogProducts.js";
import { createOneCOffersApplier } from "./applyOneCOffers.js";
import { expandOneCImportFile } from "./expandOneCImportFile.js";
import { buildOneCExchangeSessionDir } from "./onecExchangeSession.js";
import {
  createOneCCategoryResolver,
  saveOneCCategoryTree,
} from "./onecCategoryMappings.js";
import { parseCommerceMlCatalog } from "./parseCommerceMlCatalog.js";
import { parseCommerceMlOffers } from "./parseCommerceMlOffers.js";

/** Больше проблем в журнал не пишем — продавцу хватит, чтобы понять картину. */
const MAX_ISSUES = 100;

/**
 * Точка самовывоза и город для новых карточек берутся из профиля продавца:
 * CommerceML их не содержит, а без адреса товар нельзя купить.
 *
 * @param {string} sellerId
 * @returns {Promise<{ defaults: Record<string, unknown>; warning: string }>}
 */
async function resolveSellerProductDefaults(sellerId) {
  const user = await UserModel.findById(sellerId)
    .select("userAddress userAddressFlat userAddressGeo")
    .lean();

  try {
    const pickup = resolveSellerDefaultPickupFromUser(user);
    const write = await resolveProductPickupWriteFields(pickup);
    const saleCity = applyProductSaleCityFields(undefined);
    return {
      defaults: {
        productSaleCity: saleCity.productSaleCity,
        productSaleCityNormalized: saleCity.productSaleCityNormalized,
        productRegionCode: write.productRegionCode ?? "",
        productPickupAddress: write.productPickupAddress,
        productPickupLat: write.productPickupLat,
        productPickupLon: write.productPickupLon,
        productPickupLocation: write.productPickupLocation,
        productPickupLocations: write.productPickupLocations,
        productPickupEnabled: true,
        productDeliveryEnabled: false,
      },
      warning: "",
    };
  } catch (error) {
    // Не роняем импорт: карточки создадутся, но останутся вне витрины, пока
    // продавец не заполнит адрес — это видно в журнале обмена.
    return {
      defaults: { productPickupEnabled: false, productDeliveryEnabled: false },
      warning:
        error instanceof Error
          ? error.message
          : "Не удалось определить адрес самовывоза продавца",
    };
  }
}

/**
 * @param {string} sellerId
 * @param {Map<string, number>} groupCounts
 */
async function saveGroupProductCounts(sellerId, groupCounts) {
  if (groupCounts.size === 0) return;
  await OneCCategoryMappingModel.bulkWrite(
    [...groupCounts.entries()].map(([externalId, productCount]) => ({
      updateOne: {
        filter: { sellerId, externalId },
        update: { $set: { productCount } },
      },
    })),
    { ordered: false },
  );
}

/**
 * Разобрать один присланный 1С файл и применить его к каталогу продавца.
 *
 * @param {string} jobId
 */
export async function processOneCImportJob(jobId) {
  const job = await OneCImportJobModel.findById(jobId);
  if (!job) {
    throw new Error(`OneCImportJob ${jobId} не найден`);
  }
  if (
    job.status === ONEC_IMPORT_STATUS_COMPLETED ||
    job.status === ONEC_IMPORT_STATUS_FAILED
  ) {
    return job.stats ?? null;
  }

  job.status = ONEC_IMPORT_STATUS_PROCESSING;
  job.startedAt = new Date();
  job.issues = [];
  job.errorMessage = "";
  await job.save();

  const sellerId = String(job.sellerId);
  const startedAt = job.startedAt;

  /** @type {Array<{ externalId: string; name: string; message: string }>} */
  const issues = [];
  const addIssue = (issue) => {
    if (issues.length >= MAX_ISSUES) return;
    issues.push({
      externalId: String(issue.externalId ?? "").slice(0, 200),
      name: String(issue.name ?? "").slice(0, 300),
      message: String(issue.message ?? "").slice(0, 500),
    });
  };

  try {
    const user = await UserModel.findById(sellerId)
      .select("oneCIntegration.exchange")
      .lean();
    const exchange = user?.oneCIntegration?.exchange ?? {};

    const { xmlFiles, rootDir } = await expandOneCImportFile({
      filePath: job.filePath,
      filename: job.filename,
      sessionDir: buildOneCExchangeSessionDir(job.sessionId),
    });

    if (xmlFiles.length === 0) {
      throw new Error(
        `В ${job.filename} нет распознанных файлов CommerceML (import*/offers*/prices*/rests*.xml)`,
      );
    }

    const { defaults: sellerDefaults, warning } =
      await resolveSellerProductDefaults(sellerId);
    if (warning) {
      addIssue({ externalId: "", name: "", message: warning });
    }

    const resolveImagePath = createArchiveImageResolver(rootDir);

    /** @type {Record<string, unknown>} */
    const stats = { files: xmlFiles.map((row) => row.filename) };
    let fullCatalogSeen = false;

    for (const file of xmlFiles) {
      if (file.kind === ONEC_IMPORT_KIND_CATALOG) {
        /** @type {Awaited<ReturnType<typeof createOneCCategoryResolver>> | null} */
        let resolver = null;
        /** @type {ReturnType<typeof createOneCCatalogApplier> | null} */
        let applier = null;

        const ensureApplier = async () => {
          if (applier) return applier;
          resolver = await createOneCCategoryResolver(sellerId);
          applier = createOneCCatalogApplier({
            sellerId,
            resolver,
            sellerDefaults,
            resolveImagePath,
            onIssue: addIssue,
            seenAt: startedAt,
          });
          return applier;
        };

        const parsed = await parseCommerceMlCatalog({
          filePath: file.filePath,
          onGroups: async (groups) => {
            await saveOneCCategoryTree(sellerId, groups);
          },
          onProducts: async (products) => {
            const target = await ensureApplier();
            await target.applyBatch(products);
          },
        });

        const target = await ensureApplier();
        await saveGroupProductCounts(sellerId, target.groupCounts);

        if (!parsed.onlyChanges) fullCatalogSeen = true;
        stats.catalog = {
          ...target.stats,
          groups: parsed.groups,
          products: parsed.products,
          onlyChanges: parsed.onlyChanges,
          mappedGroups: resolver?.mappedCount ?? 0,
          totalGroups: resolver?.totalCount ?? 0,
        };
        continue;
      }

      if (file.kind !== ONEC_IMPORT_KIND_OFFERS) continue;

      const offersApplier = createOneCOffersApplier({
        sellerId,
        priceTypeIds: exchange.priceTypeIds ?? [],
        warehouseIds: exchange.warehouseIds ?? [],
        onIssue: addIssue,
      });

      const parsed = await parseCommerceMlOffers({
        filePath: file.filePath,
        onDictionaries: async ({ priceTypes, warehouses }) => {
          /** @type {Record<string, unknown>} */
          const set = {};
          if (priceTypes.length > 0) {
            set["oneCIntegration.exchange.knownPriceTypes"] = priceTypes;
          }
          if (warehouses.length > 0) {
            set["oneCIntegration.exchange.knownWarehouses"] = warehouses;
          }
          if (Object.keys(set).length === 0) return;
          await UserModel.updateOne({ _id: sellerId }, { $set: set });
        },
        onOffers: async (offers) => {
          await offersApplier.applyBatch(offers);
        },
      });

      stats.offers = {
        ...(stats.offers ?? {}),
        [file.filename]: { ...offersApplier.stats, parsed: parsed.offers },
      };
    }

    // Полная выгрузка каталога = «на сайте должно остаться ровно это».
    // Частичную (`СодержитТолькоИзменения`) так трактовать нельзя — снесли бы
    // всё, что 1С в этот раз просто не присылала.
    if (fullCatalogSeen) {
      const stale = await ProductModel.updateMany(
        {
          productSeller: sellerId,
          productFromOneC: true,
          $or: [
            { product1cSeenAt: null },
            { product1cSeenAt: { $lt: startedAt } },
          ],
          $and: [
            {
              $or: [
                { productIsAvailable: true },
                { productStockQuantity: { $gt: 0 } },
              ],
            },
          ],
        },
        { $set: { productIsAvailable: false, productStockQuantity: 0 } },
      );
      stats.deactivated = stale.modifiedCount ?? 0;
    }

    job.status = ONEC_IMPORT_STATUS_COMPLETED;
    job.stats = stats;
    job.issues = issues;
    job.finishedAt = new Date();
    await job.save();

    await UserModel.updateOne(
      { _id: sellerId },
      {
        $set: {
          "oneCIntegration.exchange.lastExchangeAt": new Date(),
          "oneCIntegration.lastSyncAt": new Date(),
          "oneCIntegration.lastSyncStatus": ONEC_SYNC_STATUS_SUCCESS,
          "oneCIntegration.lastSyncError": "",
          "oneCIntegration.lastSyncSummary": stats,
        },
      },
    );

    await OneCExchangeLogModel.create({
      sellerId,
      direction: ONEC_EXCHANGE_DIRECTION_COMMERCEML,
      status: ONEC_EXCHANGE_STATUS_SUCCESS,
      message: `CommerceML: ${job.filename}`,
      summary: stats,
      triggeredBy: "exchange",
    });

    return stats;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка разбора файла 1С";

    job.status = ONEC_IMPORT_STATUS_FAILED;
    job.errorMessage = message.slice(0, 2000);
    job.issues = issues;
    job.finishedAt = new Date();
    await job.save();

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
      direction: ONEC_EXCHANGE_DIRECTION_COMMERCEML,
      status: ONEC_EXCHANGE_STATUS_ERROR,
      message: `CommerceML ${job.filename}: ${message}`.slice(0, 2000),
      triggeredBy: "exchange",
    });

    logServerEvent("error", {
      event: "onec.commerceml_import_failed",
      sellerId,
      jobId: String(job._id),
      filename: job.filename,
      ...formatLogError(error),
    });

    throw error;
  }
}

/**
 * Дозапустить брошенные задачи разбора: без Redis они выполняются inline и
 * могут не пережить рестарт процесса ровно в момент обмена.
 */
export async function resumeStalledOneCImportJobs() {
  const stalled = await OneCImportJobModel.find({
    status: { $in: [ONEC_IMPORT_STATUS_PENDING, ONEC_IMPORT_STATUS_PROCESSING] },
    createdAt: { $lt: new Date(Date.now() - 15 * 60 * 1000) },
  })
    .select("_id")
    .limit(20)
    .lean();

  let restarted = 0;
  for (const row of stalled) {
    try {
      await OneCImportJobModel.updateOne(
        { _id: row._id },
        { $set: { status: ONEC_IMPORT_STATUS_PENDING } },
      );
      await processOneCImportJob(String(row._id));
      restarted += 1;
    } catch (error) {
      logServerEvent("warn", {
        event: "onec.commerceml_import_resume_failed",
        jobId: String(row._id),
        ...formatLogError(error),
      });
    }
  }

  return { restarted };
}
