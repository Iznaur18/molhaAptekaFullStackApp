import { AppError } from "../../errors/AppError.js";
import {
  FORTUNE_WHEEL_RESULT_EMPTY,
  FORTUNE_WHEEL_RESULT_WIN,
  FORTUNE_WHEEL_SPINS_PER_DAY,
  FORTUNE_WHEEL_WIN_STATUS_ACTIVE,
  FORTUNE_WHEEL_WIN_STATUS_EXPIRED,
  FORTUNE_WHEEL_WIN_STATUS_USED,
} from "../../constants/sellerFortuneWheelConstants.js";
import {
  SellerFortuneWheelConfigModel,
  SellerFortuneWheelSpinModel,
  SellerFortuneWheelWinModel,
} from "../../models/index.js";
import { resolveMskDayKey } from "../seller-lucky-box/sellerLuckyBoxDayKey.js";
import {
  assertPrizeProductsBelongToSeller,
  resolvePrizeProductNames,
} from "../seller-game-prize/sellerGamePrizeProduct.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";
import { pickFortuneWheelSectorIndex } from "./sellerFortuneWheelPick.js";

/**
 * Шанс отдаём и покупателю: размер секции на колесе пропорционален
 * chancePercent, так что скрывать его бессмысленно.
 */
const toSectorPayload = (sector) => ({
  discountPercent: sector.discountPercent,
  durationHours: sector.durationHours,
  chancePercent: sector.chancePercent,
  enabled: sector.enabled !== false,
  prizeProductId: sector.prizeProductId ? String(sector.prizeProductId) : null,
});

const toSectorConfigPayload = (sector) => ({
  ...toSectorPayload(sector),
});

const toWinPayload = (win) => ({
  id: String(win._id),
  sellerId: String(win.sellerId),
  discountPercent: win.discountPercent,
  expiresAt: win.expiresAt,
  prizeProductId: win.prizeProductId ? String(win.prizeProductId) : null,
  prizeProductName: win.prizeProductName ?? null,
});

const toConfigPayload = (config) => ({
  enabled: Boolean(config?.enabled),
  sectors: Array.isArray(config?.sectors)
    ? config.sectors.map(toSectorConfigPayload)
    : [],
  spinsTotal: config?.spinsTotal ?? 0,
  winsTotal: config?.winsTotal ?? 0,
});

async function findActiveWin({ sellerId, buyerId }) {
  return SellerFortuneWheelWinModel.findOne({
    sellerId,
    buyerId,
    status: FORTUNE_WHEEL_WIN_STATUS_ACTIVE,
    expiresAt: { $gt: new Date() },
  })
    .sort({ discountPercent: -1 })
    .lean();
}

/**
 * ВРЕМЕННО для локального теста: вне прода продавец может перекручивать
 * колесо на своей витрине без дневного лимита (см. allowSelfPlay на
 * клиенте у «Коробок удачи»).
 * TODO: убрать после приёмки фичи.
 */
const isSelfPlayReplayAllowed = ({ sellerId, buyerId }) =>
  String(sellerId) === String(buyerId) && process.env.NODE_ENV !== "production";

/**
 * Публичное состояние колеса на витрине продавца. Секции отдаём без
 * шансов: покупатель видит, что на колесе, но не вероятности.
 */
export async function getSellerFortuneWheelState({ sellerId, buyerId }) {
  const config = await SellerFortuneWheelConfigModel.findOne({ sellerId }).lean();
  if (!config?.enabled) {
    return { enabled: false };
  }

  const sectors = (config.sectors ?? []).map(toSectorPayload);
  const base = {
    enabled: true,
    sectors,
    spinsTotal: FORTUNE_WHEEL_SPINS_PER_DAY,
  };

  if (!buyerId) {
    return { ...base, canSpin: false, requiresAuth: true };
  }

  const dayKey = resolveMskDayKey();
  const todaySpin = isSelfPlayReplayAllowed({ sellerId, buyerId })
    ? null
    : await SellerFortuneWheelSpinModel.findOne({ sellerId, buyerId, dayKey }).lean();

  if (!todaySpin) {
    const activeWin = await findActiveWin({ sellerId, buyerId });
    return {
      ...base,
      canSpin: true,
      activeWin: activeWin ? toWinPayload(activeWin) : null,
    };
  }

  const win = await SellerFortuneWheelWinModel.findOne({
    spinId: todaySpin._id,
  }).lean();

  return {
    ...base,
    canSpin: false,
    todaySpin: {
      result: todaySpin.result,
      sectorIndex: todaySpin.sectorIndex,
      prize: todaySpin.prizeSnapshot ? toSectorPayload(todaySpin.prizeSnapshot) : null,
      winExpiresAt: win?.expiresAt ?? null,
      winStatus: win?.status ?? null,
    },
  };
}

/**
 * Спин колеса. Раз в день (по МСК) на продавца; секцию выбирает сервер
 * взвешенным рандомом по chancePercent, клиент лишь анимирует остановку
 * на полученном sectorIndex. Лимит дополнительно гарантирует уникальный
 * индекс {sellerId, buyerId, dayKey} на SellerFortuneWheelSpin.
 */
export async function spinSellerFortuneWheel({ sellerId, buyerId }) {
  const config = await SellerFortuneWheelConfigModel.findOne({ sellerId }).lean();
  if (!config?.enabled) {
    throw new AppError(409, "Продавец выключил «Колесо фортуны»");
  }
  const sectors = Array.isArray(config.sectors) ? config.sectors : [];
  if (!sectors.some((sector) => sector?.enabled !== false)) {
    throw new AppError(409, "Продавец ещё не настроил призы");
  }

  const dayKey = resolveMskDayKey();
  const selfPlay = isSelfPlayReplayAllowed({ sellerId, buyerId });

  // Спин + выигрыш + статистика — одной транзакцией: сбой посередине не
  // должен оставить спин без выигрыша (день бы сгорел впустую).
  return runInTransaction(async (session) => {
    const existingSpin = await SellerFortuneWheelSpinModel.findOne(
      { sellerId, buyerId, dayKey },
      null,
      withMongoSession({}, session),
    ).lean();
    // TODO(self-play): временно для приёмки — у себя на витрине вне прода
    // сыгранный день сбрасывается на следующем спине, чтобы можно было
    // перекрутить после обновления страницы. Убрать после приёмки.
    if (existingSpin && selfPlay) {
      await SellerFortuneWheelSpinModel.deleteMany(
        { sellerId, buyerId, dayKey },
        withMongoSession({}, session),
      );
      await SellerFortuneWheelWinModel.deleteMany(
        { spinId: existingSpin._id },
        withMongoSession({}, session),
      );
    } else if (existingSpin) {
      throw new AppError(
        409,
        "Вы уже крутили колесо у этого продавца сегодня. Приходите завтра!",
      );
    }

    const sectorIndex = pickFortuneWheelSectorIndex(sectors);
    if (sectorIndex < 0) {
      throw new AppError(409, "Продавец ещё не настроил шансы секций");
    }
    const sector = sectors[sectorIndex];
    const isWin = sector?.enabled !== false;

    // Товар-приз: подтягиваем название для снимков спина и выигрыша.
    const prizeProductId =
      isWin && sector.prizeProductId ? String(sector.prizeProductId) : null;
    const prizeProductName = prizeProductId
      ? ((await resolvePrizeProductNames([prizeProductId])).get(prizeProductId) ?? null)
      : null;

    let spin;
    try {
      [spin] = await SellerFortuneWheelSpinModel.create(
        [
          {
            sellerId,
            buyerId,
            dayKey,
            sectorIndex,
            result: isWin ? FORTUNE_WHEEL_RESULT_WIN : FORTUNE_WHEEL_RESULT_EMPTY,
            prizeSnapshot: isWin
              ? { ...toSectorPayload(sector), prizeProductName }
              : null,
          },
        ],
        withMongoSession({}, session),
      );
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError(
          409,
          "Вы уже крутили колесо у этого продавца сегодня. Приходите завтра!",
        );
      }
      throw error;
    }

    let win = null;
    if (isWin) {
      const expiresAt = new Date(Date.now() + sector.durationHours * 3_600_000);
      [win] = await SellerFortuneWheelWinModel.create(
        [
          {
            buyerId,
            sellerId,
            discountPercent: sector.discountPercent,
            durationHours: sector.durationHours,
            expiresAt,
            spinId: spin._id,
            prizeProductId,
            prizeProductName,
          },
        ],
        withMongoSession({}, session),
      );
    }

    await SellerFortuneWheelConfigModel.updateOne(
      { _id: config._id },
      { $inc: { spinsTotal: 1, ...(isWin ? { winsTotal: 1 } : {}) } },
      withMongoSession({}, session),
    );

    return {
      result: isWin ? FORTUNE_WHEEL_RESULT_WIN : FORTUNE_WHEEL_RESULT_EMPTY,
      sectorIndex,
      prize: win
        ? {
            discountPercent: win.discountPercent,
            durationHours: win.durationHours,
            expiresAt: win.expiresAt,
            prizeProductId,
            prizeProductName,
          }
        : null,
    };
  });
}

export async function getMyFortuneWheelConfig({ sellerId }) {
  const config = await SellerFortuneWheelConfigModel.findOne({ sellerId }).lean();
  return { config: toConfigPayload(config) };
}

export async function putMyFortuneWheelConfig({ sellerId, body }) {
  // Товар-приз — только свой товар; чужой или несуществующий id режем 400.
  await assertPrizeProductsBelongToSeller({
    sellerId,
    productIds: body.sectors.map((sector) => sector.prizeProductId),
  });

  const config = await SellerFortuneWheelConfigModel.findOneAndUpdate(
    { sellerId },
    {
      $set: {
        enabled: body.enabled,
        sectors: body.sectors.map((sector) => ({
          discountPercent: sector.discountPercent,
          durationHours: sector.durationHours,
          chancePercent: sector.chancePercent,
          enabled: sector.enabled !== false,
          prizeProductId: sector.prizeProductId ?? null,
        })),
      },
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  ).lean();

  return {
    message: body.enabled
      ? "«Колесо фортуны» включено на вашей витрине"
      : "Настройки «Колеса фортуны» сохранены",
    config: toConfigPayload(config),
  };
}

/** Активные выигрыши покупателя; просроченные лениво помечаются expired. */
export async function listMyFortuneWheelWins({ buyerId }) {
  const now = new Date();
  await SellerFortuneWheelWinModel.updateMany(
    { buyerId, status: FORTUNE_WHEEL_WIN_STATUS_ACTIVE, expiresAt: { $lte: now } },
    { $set: { status: FORTUNE_WHEEL_WIN_STATUS_EXPIRED } },
  );
  const wins = await SellerFortuneWheelWinModel.find({
    buyerId,
    status: FORTUNE_WHEEL_WIN_STATUS_ACTIVE,
    expiresAt: { $gt: now },
  })
    .sort({ expiresAt: 1 })
    .lean();
  return { wins: wins.map(toWinPayload) };
}

/** Для createOrder: активные выигрыши пользователя по всем продавцам. */
export async function listActiveFortuneWheelWinsForUser({ userId }) {
  return SellerFortuneWheelWinModel.find({
    buyerId: userId,
    status: FORTUNE_WHEEL_WIN_STATUS_ACTIVE,
    expiresAt: { $gt: new Date() },
  }).lean();
}

/**
 * Пометить выигрыши использованными внутри транзакции создания заказа.
 * Строго одноразово: если хоть один выигрыш уже погашен (гонка двух
 * заказов), бросаем 409 — транзакция заказа откатится, а не даст скидку
 * дважды.
 */
export async function markFortuneWheelWinsUsed({ winIds, orderId, session }) {
  if (!Array.isArray(winIds) || winIds.length === 0) {
    return;
  }
  const result = await SellerFortuneWheelWinModel.updateMany(
    { _id: { $in: winIds }, status: FORTUNE_WHEEL_WIN_STATUS_ACTIVE },
    {
      $set: {
        status: FORTUNE_WHEEL_WIN_STATUS_USED,
        usedInOrderId: orderId,
        usedAt: new Date(),
      },
    },
    { session },
  );
  if (result.matchedCount !== winIds.length) {
    throw new AppError(
      409,
      "Выигрыш в «Колесе фортуны» уже использован в другом заказе",
    );
  }
}

/**
 * Сжечь выигрыши (товар-приз недоступен к моменту заказа) внутри
 * транзакции создания заказа. Трогает только still-active.
 */
export async function markFortuneWheelWinsExpired({ winIds, session }) {
  if (!Array.isArray(winIds) || winIds.length === 0) {
    return;
  }
  await SellerFortuneWheelWinModel.updateMany(
    { _id: { $in: winIds }, status: FORTUNE_WHEEL_WIN_STATUS_ACTIVE },
    { $set: { status: FORTUNE_WHEEL_WIN_STATUS_EXPIRED } },
    { session },
  );
}
