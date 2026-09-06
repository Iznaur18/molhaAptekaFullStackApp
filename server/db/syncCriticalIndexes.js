import ProductCategoryDisplayModel from "../models/ProductCategoryDisplayModel.js";
import { IntroAdCampaignModel } from "../models/IntroAdCampaignModel.js";
import { SiteHeaderBannerCampaignModel } from "../models/SiteHeaderBannerCampaignModel.js";
import {
  AffiliateLedgerEntryModel,
  EscrowLedgerEntryModel,
  MoneyIdempotencyRecordModel,
  PaymentModel,
  PendingRegistrationModel,
  ProductPriceOfferModel,
  ReferralLedgerEntryModel,
  UserModel,
} from "../models/index.js";
import { logServerEvent } from "../utils/logServerEvent.js";

/**
 * Пересоздаёт индексы моделей, у которых в схеме менялись ОПЦИИ индексов,
 * или которые критичны для идемпотентности денег.
 * Также снимает stale unique (пример: pendingTokenHash_1 → E11000 на null).
 *
 * `autoIndex` мы НЕ выключаем (mongoose создаёт индексы сам) — иначе на
 * свежей проде не появились бы partial-unique индексы рекламных кампаний,
 * а на них держится защита от двойного резерва баллов. Этот список —
 * явная страховка для денежных моделей, а не замена autoIndex.
 */
async function syncModelIndexes(model, modelName) {
  try {
    await model.syncIndexes();
    logServerEvent("info", {
      event: "indexes_synced",
      model: modelName,
    });
  } catch (err) {
    logServerEvent("error", {
      event: "indexes_sync_failed",
      model: modelName,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function syncCriticalIndexes() {
  await syncModelIndexes(ProductCategoryDisplayModel, "ProductCategoryDisplay");
  await syncModelIndexes(UserModel, "User");
  await syncModelIndexes(ReferralLedgerEntryModel, "ReferralLedgerEntry");
  await syncModelIndexes(PendingRegistrationModel, "PendingRegistration");
  await syncModelIndexes(MoneyIdempotencyRecordModel, "MoneyIdempotencyRecord");
  await syncModelIndexes(AffiliateLedgerEntryModel, "AffiliateLedgerEntry");
  await syncModelIndexes(ProductPriceOfferModel, "ProductPriceOffer");
  // Partial-unique по заказу и по услуге: не дают выставить второй
  // оплачиваемый счёт на то, за что уже платят.
  await syncModelIndexes(PaymentModel, "Payment");
  // Состояние переехало на строки — старый индекс по `state + releaseDueAt`
  // надо не только перестать использовать, но и убрать.
  await syncModelIndexes(EscrowLedgerEntryModel, "EscrowLedgerEntry");
  // Partial-unique по advertiserId: не даёт завести вторую открытую кампанию
  // и, как следствие, зарезервировать баллы дважды.
  await syncModelIndexes(IntroAdCampaignModel, "IntroAdCampaign");
  await syncModelIndexes(SiteHeaderBannerCampaignModel, "SiteHeaderBannerCampaign");
}
