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

  // `createIndexes`, а не `syncIndexes`: последний ДРОПАЕТ всё, чего нет в
  // схеме, а на проде в products исторически живут индексы, заведённые руками.
  // Нам нужно только досоздать новые — ничего убирать не требуется.
  //
  // Сам `seller_onec_guid_unique` пересобирать не нужно: поля и опции индекса
  // не изменились, расширение product1cGuid 64→128 — это maxlength схемы,
  // который проверяется на валидации, а не в индексе.
  await UserModel.createIndexes();
  await ProductModel.createIndexes();
  await OneCCategoryMappingModel.createIndexes();
  await OneCExchangeSessionModel.createIndexes();
  await OneCImportJobModel.createIndexes();
};
