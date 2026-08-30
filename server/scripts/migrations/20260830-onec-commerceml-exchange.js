import {
  OneCCategoryMappingModel,
  OneCExchangeSessionModel,
  OneCImportJobModel,
  ProductModel,
  UserModel,
} from "../../models/index.js";
import { ONEC_CHANNEL_PULL } from "../../constants/onecExchangeConstants.js";

/**
 * Канал CommerceML: новые коллекции, индексы и обратная совместимость.
 *
 * Ключевой момент — `seller_onec_guid_unique`: у торговых предложений
 * `Ид` имеет вид `ИдТовара#ИдХарактеристики`, это 73 символа против прежнего
 * лимита в 64. Схема расширена до 128, индекс нужно пересобрать.
 *
 * Продавцы, настроенные до появления канала, работают по `pull` — проставляем
 * его явно, чтобы `mode=checkauth` не пустил их 1С в чужой протокол.
 */
export const up = async () => {
  await UserModel.updateMany(
    { "oneCIntegration.channel": { $exists: false } },
    { $set: { "oneCIntegration.channel": ONEC_CHANNEL_PULL } },
  );

  await Promise.all([
    UserModel.syncIndexes(),
    ProductModel.syncIndexes(),
    OneCCategoryMappingModel.syncIndexes(),
    OneCExchangeSessionModel.syncIndexes(),
    OneCImportJobModel.syncIndexes(),
  ]);
};
