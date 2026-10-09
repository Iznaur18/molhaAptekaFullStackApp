import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { AppError } from "../../errors/AppError.js";
import { ProductModel, UserModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { invalidateCatalogProductsCache } from "../product/catalogProductsResponseCache.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";

/**
 * Пауза магазина: продавец разом убирает все товары с витрины и так же разом
 * возвращает.
 *
 * Прячем тем же `productIsAvailable: false`, что и поштучное «Скрыть от
 * покупателей»: на это поле уже смотрят лента, поиск, корзина, избранное,
 * оформление заказа, промокоды и аукцион — второй признак видимости пришлось
 * бы дописывать в каждое из этих мест. Метка `productPausedWithStore` отличает
 * «скрыла пауза» от «продавец скрыл сам»: при включении возвращается только
 * первое.
 *
 * Замок «есть заказы без подтверждения покупателем» здесь намеренно не
 * действует: пауза не должна оставлять на витрине товары с идущими заказами,
 * иначе по ним продолжат приходить новые. Сами оформленные заказы от
 * `productIsAvailable` не зависят и идут как обычно.
 */

/** @param {string} sellerId */
const visibleProductsFilter = (sellerId) => ({
  productSeller: sellerId,
  productIsAvailable: { $ne: false },
});

/**
 * @param {{ sellerStorePaused?: boolean; sellerStorePausedAt?: Date | null }} user
 * @param {string} sellerId
 */
const projectSellerStorePause = async (user, sellerId) => {
  const [visibleProductCount, pausedProductCount] = await Promise.all([
    ProductModel.countDocuments(visibleProductsFilter(sellerId)),
    ProductModel.countDocuments({
      productSeller: sellerId,
      productPausedWithStore: true,
    }),
  ]);

  return {
    paused: user.sellerStorePaused === true,
    pausedAt: user.sellerStorePausedAt
      ? new Date(user.sellerStorePausedAt).toISOString()
      : null,
    visibleProductCount,
    pausedProductCount,
  };
};

/**
 * @param {string} userId
 */
export async function getSellerStorePause(userId) {
  const user = await UserModel.findById(userId)
    .select("sellerStorePaused sellerStorePausedAt")
    .lean();
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }
  return projectSellerStorePause(user, String(userId));
}

/**
 * @param {string} sellerId
 * @param {import('mongoose').ClientSession | null} [session]
 */
const hideVisibleProducts = (sellerId, session = null) =>
  ProductModel.updateMany(
    visibleProductsFilter(sellerId),
    { $set: { productIsAvailable: false, productPausedWithStore: true } },
    { session: session ?? undefined },
  );

/**
 * Возвращает на витрину то, что скрыла пауза. Товар, у которого за время паузы
 * кончился остаток (например, пришёл ноль из 1С) или правка ушла на проверку
 * модератору, остаётся скрытым — как было бы и без паузы.
 *
 * @param {string} sellerId
 * @param {import('mongoose').ClientSession | null} session
 */
const restorePausedProducts = async (sellerId, session) => {
  const options = { session: session ?? undefined };
  const restored = await ProductModel.updateMany(
    {
      productSeller: sellerId,
      productPausedWithStore: true,
      productStockQuantity: { $gt: 0 },
      productModerationStatus: PRODUCT_MODERATION_APPROVED,
    },
    { $set: { productIsAvailable: true }, $unset: { productPausedWithStore: "" } },
    options,
  );
  await ProductModel.updateMany(
    { productSeller: sellerId, productPausedWithStore: true },
    { $unset: { productPausedWithStore: "" } },
    options,
  );
  return restored.modifiedCount ?? 0;
};

/**
 * Включить или выключить паузу магазина. Повторный вызов с тем же значением
 * безопасен: уже скрытое не трогается, возвращать нечего.
 *
 * @param {{ userId: string; paused: boolean }} input
 */
export async function setSellerStorePause({ userId, paused }) {
  const sellerId = String(userId);

  const affectedProducts = await runInTransaction(async (session) => {
    const user = await UserModel.findById(sellerId)
      .select("_id")
      .session(session ?? null);
    if (!user) {
      throw new AppError(404, "Пользователь не найден");
    }

    await UserModel.updateOne(
      { _id: sellerId },
      {
        $set: {
          sellerStorePaused: paused,
          sellerStorePausedAt: paused ? new Date() : null,
        },
      },
      { session: session ?? undefined },
    );

    if (paused) {
      const hidden = await hideVisibleProducts(sellerId, session);
      return hidden.modifiedCount ?? 0;
    }
    return restorePausedProducts(sellerId, session);
  });

  if (affectedProducts > 0) {
    invalidateCatalogProductsCache();
  }

  logServerEvent("info", {
    event: paused ? "seller.store_paused" : "seller.store_resumed",
    userId: sellerId,
    affectedProducts,
  });

  return getSellerStorePause(sellerId);
}

/**
 * @param {string} sellerId
 * @returns {Promise<boolean>}
 */
export async function isSellerStorePaused(sellerId) {
  if (!sellerId) return false;
  const user = await UserModel.findById(sellerId).select("sellerStorePaused").lean();
  return user?.sellerStorePaused === true;
}

/**
 * Прячет товары, ставшие видимыми во время паузы: созданные, одобренные
 * модератором, пополненные или пришедшие из 1С. Вызывается после каждого
 * такого пути записи; без паузы ничего не делает.
 *
 * @param {unknown} sellerId
 * @returns {Promise<number>} сколько товаров скрыто
 */
export async function enforceSellerStorePause(sellerId) {
  const id = sellerId ? String(sellerId) : "";
  if (!(await isSellerStorePaused(id))) {
    return 0;
  }
  const hidden = await hideVisibleProducts(id);
  const hiddenCount = hidden.modifiedCount ?? 0;
  if (hiddenCount > 0) {
    invalidateCatalogProductsCache();
  }
  return hiddenCount;
}
