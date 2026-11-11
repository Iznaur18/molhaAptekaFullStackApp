import { AppError } from "../../errors/AppError.js";
import {
  LUCKY_BOX_ATTEMPTS_PER_DAY,
  LUCKY_BOX_BOXES_TOTAL,
  LUCKY_BOX_RESULT_EMPTY,
  LUCKY_BOX_RESULT_WIN,
  LUCKY_BOX_WIN_STATUS_ACTIVE,
  LUCKY_BOX_WIN_STATUS_EXPIRED,
  LUCKY_BOX_WIN_STATUS_USED,
} from "../../constants/sellerLuckyBoxConstants.js";
import {
  SellerLuckyBoxConfigModel,
  SellerLuckyBoxPlayModel,
  SellerLuckyBoxWinModel,
} from "../../models/index.js";
import { resolveMskDayKey } from "./sellerLuckyBoxDayKey.js";
import {
  assertPrizeProductsBelongToSeller,
  resolvePrizeProductNames,
} from "../seller-game-prize/sellerGamePrizeProduct.js";
import { generateLuckyBoxLayout } from "./sellerLuckyBoxLayout.js";

const toPrizePayload = (prize) => ({
  discountPercent: prize.discountPercent,
  durationHours: prize.durationHours,
  enabled: prize.enabled !== false,
  prizeProductId: prize.prizeProductId ? String(prize.prizeProductId) : null,
});

/** Включённые призы конфига — только они попадают в раскладку. */
const listEnabledPrizes = (config) =>
  (Array.isArray(config?.prizes) ? config.prizes : []).filter(
    (prize) => prize?.enabled !== false,
  );

/** Привязка скидок к коробкам раскладки: layout[i] ↔ percents[i]. */
const toLayoutPrizes = (layout, percents, products = []) => {
  if (
    !Array.isArray(layout) ||
    !Array.isArray(percents) ||
    percents.length !== layout.length
  ) {
    return null;
  }
  const productByBox = new Map(
    (Array.isArray(products) ? products : []).map((entry) => [entry.boxIndex, entry]),
  );
  return layout.map((boxIndex, index) => {
    const product = productByBox.get(boxIndex);
    return {
      boxIndex,
      discountPercent: percents[index],
      prizeProductId: product?.prizeProductId ? String(product.prizeProductId) : null,
      prizeProductName: product?.prizeProductName ?? null,
    };
  });
};

/**
 * Снимок товаров-призов раскладки: layout[i] ↔ enabledPrizes[i], названия
 * подтягиваем одним запросом. Хранится в попытке, чтобы раскрытие коробок
 * не зависело от правок конфига после игры.
 */
async function buildLayoutPrizeProducts(layout, enabledPrizes) {
  const productIds = enabledPrizes
    .map((prize) => (prize?.prizeProductId ? String(prize.prizeProductId) : null))
    .filter(Boolean);
  const namesById =
    productIds.length > 0 ? await resolvePrizeProductNames(productIds) : new Map();
  return layout.map((boxIndex, index) => {
    const prize = enabledPrizes[index];
    const prizeProductId = prize?.prizeProductId ? String(prize.prizeProductId) : null;
    return {
      boxIndex,
      prizeProductId,
      prizeProductName: prizeProductId ? (namesById.get(prizeProductId) ?? null) : null,
    };
  });
}

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
  prizes: Array.isArray(config?.prizes) ? config.prizes.map(toPrizePayload) : [],
  playsTotal: config?.playsTotal ?? 0,
  winsTotal: config?.winsTotal ?? 0,
});

async function findActiveWin({ sellerId, buyerId }) {
  return SellerLuckyBoxWinModel.findOne({
    sellerId,
    buyerId,
    status: LUCKY_BOX_WIN_STATUS_ACTIVE,
    expiresAt: { $gt: new Date() },
  })
    .sort({ discountPercent: -1 })
    .lean();
}

/**
 * ВРЕМЕННО для локального теста: вне прода продавец может переигрывать на
 * своей витрине без дневного лимита (см. allowSelfPlay на клиенте).
 * TODO: убрать после приёмки фичи.
 */
const isSelfPlayReplayAllowed = ({ sellerId, buyerId }) =>
  String(sellerId) === String(buyerId) && process.env.NODE_ENV !== "production";

/** Попытки покупателя за сегодня (по МСК) в порядке attemptIndex. */
async function listTodayPlays({ sellerId, buyerId, dayKey }) {
  return SellerLuckyBoxPlayModel.find({ sellerId, buyerId, dayKey })
    .sort({ attemptIndex: 1 })
    .lean();
}

/** Приз ко второй попытке не даётся: выиграл — попытки на сегодня кончились. */
const hasWinningPlay = (plays) =>
  plays.some((play) => play.result === LUCKY_BOX_RESULT_WIN);

/**
 * Публичное состояние игры на витрине продавца. Раскладку (layout) наружу
 * не отдаём до совершённой попытки — иначе приз можно «подсмотреть».
 */
export async function getSellerLuckyBoxState({ sellerId, buyerId }) {
  const config = await SellerLuckyBoxConfigModel.findOne({ sellerId }).lean();
  if (!config?.enabled) {
    return { enabled: false, boxesTotal: LUCKY_BOX_BOXES_TOTAL };
  }

  const prizesTotal = listEnabledPrizes(config).length;

  if (!buyerId) {
    return {
      enabled: true,
      boxesTotal: LUCKY_BOX_BOXES_TOTAL,
      prizesTotal,
      attemptsTotal: LUCKY_BOX_ATTEMPTS_PER_DAY,
      canPlay: false,
      requiresAuth: true,
    };
  }

  const dayKey = resolveMskDayKey();
  const todayPlays = isSelfPlayReplayAllowed({ sellerId, buyerId })
    ? []
    : await listTodayPlays({ sellerId, buyerId, dayKey });

  if (todayPlays.length === 0) {
    const activeWin = await findActiveWin({ sellerId, buyerId });
    return {
      enabled: true,
      boxesTotal: LUCKY_BOX_BOXES_TOTAL,
      prizesTotal,
      attemptsTotal: LUCKY_BOX_ATTEMPTS_PER_DAY,
      attemptsUsed: 0,
      canPlay: true,
      activeWin: activeWin ? toWinPayload(activeWin) : null,
    };
  }

  const won = hasWinningPlay(todayPlays);
  const canPlay = !won && todayPlays.length < LUCKY_BOX_ATTEMPTS_PER_DAY;
  // Раскладку раскрываем только когда попытки исчерпаны или приз найден —
  // иначе вторая попытка была бы гарантированным выигрышем.
  const finished = won || !canPlay;
  const winPlayIds = todayPlays
    .filter((play) => play.result === LUCKY_BOX_RESULT_WIN)
    .map((play) => play._id);
  const wins = winPlayIds.length
    ? await SellerLuckyBoxWinModel.find({ playId: { $in: winPlayIds } }).lean()
    : [];
  const winByPlayId = new Map(wins.map((win) => [String(win.playId), win]));

  return {
    enabled: true,
    boxesTotal: LUCKY_BOX_BOXES_TOTAL,
    prizesTotal,
    attemptsTotal: LUCKY_BOX_ATTEMPTS_PER_DAY,
    attemptsUsed: todayPlays.length,
    canPlay,
    todayPlays: todayPlays.map((play) => {
      const win = winByPlayId.get(String(play._id)) ?? null;
      return {
        result: play.result,
        pickedBoxIndex: play.pickedBoxIndex,
        layout: finished ? play.layout : null,
        layoutPrizes: finished
          ? toLayoutPrizes(
              play.layout,
              play.layoutPrizePercents,
              play.layoutPrizeProducts,
            )
          : null,
        prize: play.prizeSnapshot ? toPrizePayload(play.prizeSnapshot) : null,
        winExpiresAt: win?.expiresAt ?? null,
        winStatus: win?.status ?? null,
      };
    }),
  };
}

/**
 * Попытка открыть коробку. Попыток в день до LUCKY_BOX_ATTEMPTS_PER_DAY,
 * вторая даётся только если первая пустая; раскладка одна на обе попытки.
 * Лимит дополнительно гарантирует уникальный индекс
 * {sellerId, buyerId, dayKey, attemptIndex} на SellerLuckyBoxPlay.
 */
export async function playSellerLuckyBox({ sellerId, buyerId, boxIndex }) {
  const config = await SellerLuckyBoxConfigModel.findOne({ sellerId }).lean();
  if (!config?.enabled) {
    throw new AppError(409, "Продавец выключил «Коробки удачи»");
  }
  const enabledPrizes = listEnabledPrizes(config);
  if (enabledPrizes.length === 0) {
    throw new AppError(409, "Продавец ещё не настроил призы");
  }

  const dayKey = resolveMskDayKey();
  let todayPlays = await listTodayPlays({ sellerId, buyerId, dayKey });
  // TODO(self-play): временно для приёмки — у себя на витрине вне прода
  // исчерпанный день (выигрыш или обе попытки) сбрасывается на следующей
  // попытке, чтобы можно было переиграть после обновления страницы.
  // Убрать после приёмки.
  if (
    isSelfPlayReplayAllowed({ sellerId, buyerId }) &&
    (hasWinningPlay(todayPlays) || todayPlays.length >= LUCKY_BOX_ATTEMPTS_PER_DAY)
  ) {
    await SellerLuckyBoxPlayModel.deleteMany({ sellerId, buyerId, dayKey });
    await SellerLuckyBoxWinModel.deleteMany({
      playId: { $in: todayPlays.map((play) => play._id) },
    });
    todayPlays = [];
  }
  if (hasWinningPlay(todayPlays)) {
    throw new AppError(
      409,
      "Сегодня вы уже выиграли приз у этого продавца. Приходите завтра!",
    );
  }
  if (todayPlays.length >= LUCKY_BOX_ATTEMPTS_PER_DAY) {
    throw new AppError(
      409,
      "Попытки на сегодня закончились. Приходите завтра — коробки перемешаются!",
    );
  }
  if (todayPlays.some((play) => play.pickedBoxIndex === boxIndex)) {
    throw new AppError(409, "Эта коробка уже открыта — выберите другую");
  }

  // Раскладка одна на весь день: генерируем на первую попытку.
  const firstPlay = todayPlays[0] ?? null;
  const layout = firstPlay?.layout ?? generateLuckyBoxLayout(enabledPrizes.length);
  // Скидки раскладки — снимок первой попытки; для старых записей (или её
  // отсутствия) берём текущие включённые призы конфига.
  const layoutPrizePercents =
    Array.isArray(firstPlay?.layoutPrizePercents) &&
    firstPlay.layoutPrizePercents.length === layout.length
      ? firstPlay.layoutPrizePercents
      : enabledPrizes.map((enabledPrize) => enabledPrize.discountPercent);
  // Товары-призы раскладки — тоже снимок первой попытки.
  const layoutPrizeProducts =
    Array.isArray(firstPlay?.layoutPrizeProducts) &&
    firstPlay.layoutPrizeProducts.length === layout.length
      ? firstPlay.layoutPrizeProducts
      : await buildLayoutPrizeProducts(layout, enabledPrizes);
  const prizeIndex = layout.indexOf(boxIndex);
  const isWin = prizeIndex !== -1;
  const prize = isWin ? enabledPrizes[prizeIndex] : null;

  // Товар-приз: подтягиваем название для снимков попытки и выигрыша.
  const prizeProductId =
    isWin && prize.prizeProductId ? String(prize.prizeProductId) : null;
  const prizeProductName = prizeProductId
    ? ((await resolvePrizeProductNames([prizeProductId])).get(prizeProductId) ?? null)
    : null;

  let play;
  try {
    play = await SellerLuckyBoxPlayModel.create({
      sellerId,
      buyerId,
      dayKey,
      attemptIndex: todayPlays.length + 1,
      layout,
      layoutPrizePercents,
      layoutPrizeProducts,
      pickedBoxIndex: boxIndex,
      result: isWin ? LUCKY_BOX_RESULT_WIN : LUCKY_BOX_RESULT_EMPTY,
      prizeSnapshot: prize ? { ...toPrizePayload(prize), prizeProductName } : null,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError(
        409,
        "Сегодня вы уже открывали коробку у этого продавца. Приходите завтра!",
      );
    }
    throw error;
  }

  let win = null;
  if (isWin) {
    const expiresAt = new Date(Date.now() + prize.durationHours * 3_600_000);
    win = await SellerLuckyBoxWinModel.create({
      buyerId,
      sellerId,
      discountPercent: prize.discountPercent,
      durationHours: prize.durationHours,
      expiresAt,
      playId: play._id,
      prizeProductId,
      prizeProductName,
    });
  }

  await SellerLuckyBoxConfigModel.updateOne(
    { _id: config._id },
    { $inc: { playsTotal: 1, ...(isWin ? { winsTotal: 1 } : {}) } },
  );

  const attemptsLeft = isWin ? 0 : LUCKY_BOX_ATTEMPTS_PER_DAY - (todayPlays.length + 1);

  return {
    result: isWin ? LUCKY_BOX_RESULT_WIN : LUCKY_BOX_RESULT_EMPTY,
    pickedBoxIndex: boxIndex,
    // Раскладку раскрываем только по завершении: иначе вторая попытка —
    // гарантированный выигрыш.
    layout: attemptsLeft > 0 ? null : layout,
    layoutPrizes:
      attemptsLeft > 0
        ? null
        : toLayoutPrizes(layout, layoutPrizePercents, layoutPrizeProducts),
    attemptsTotal: LUCKY_BOX_ATTEMPTS_PER_DAY,
    attemptsLeft,
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
}

export async function getMyLuckyBoxConfig({ sellerId }) {
  const config = await SellerLuckyBoxConfigModel.findOne({ sellerId }).lean();
  return { config: toConfigPayload(config) };
}

export async function putMyLuckyBoxConfig({ sellerId, body }) {
  // Товар-приз — только свой товар; чужой или несуществующий id режем 400.
  await assertPrizeProductsBelongToSeller({
    sellerId,
    productIds: body.prizes.map((prize) => prize.prizeProductId),
  });

  const config = await SellerLuckyBoxConfigModel.findOneAndUpdate(
    { sellerId },
    {
      $set: {
        enabled: body.enabled,
        prizes: body.prizes.map((prize) => ({
          discountPercent: prize.discountPercent,
          durationHours: prize.durationHours,
          enabled: prize.enabled !== false,
          prizeProductId: prize.prizeProductId ?? null,
        })),
      },
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  ).lean();

  return {
    message: body.enabled
      ? "«Коробки удачи» включены на вашей витрине"
      : "Настройки «Коробок удачи» сохранены",
    config: toConfigPayload(config),
  };
}

/** Активные выигрыши покупателя; просроченные лениво помечаются expired. */
export async function listMyLuckyBoxWins({ buyerId }) {
  const now = new Date();
  await SellerLuckyBoxWinModel.updateMany(
    { buyerId, status: LUCKY_BOX_WIN_STATUS_ACTIVE, expiresAt: { $lte: now } },
    { $set: { status: LUCKY_BOX_WIN_STATUS_EXPIRED } },
  );
  const wins = await SellerLuckyBoxWinModel.find({
    buyerId,
    status: LUCKY_BOX_WIN_STATUS_ACTIVE,
    expiresAt: { $gt: now },
  })
    .sort({ expiresAt: 1 })
    .lean();
  return { wins: wins.map(toWinPayload) };
}

/** Для createOrder: активные выигрыши пользователя по всем продавцам. */
export async function listActiveLuckyBoxWinsForUser({ userId }) {
  return SellerLuckyBoxWinModel.find({
    buyerId: userId,
    status: LUCKY_BOX_WIN_STATUS_ACTIVE,
    expiresAt: { $gt: new Date() },
  }).lean();
}

/**
 * Пометить выигрыши использованными внутри транзакции создания заказа.
 * Строго одноразово: если хоть один выигрыш уже погашен (гонка двух
 * заказов), бросаем 409 — транзакция заказа откатится, а не даст скидку
 * дважды.
 */
export async function markLuckyBoxWinsUsed({ winIds, orderId, session }) {
  if (!Array.isArray(winIds) || winIds.length === 0) {
    return;
  }
  const result = await SellerLuckyBoxWinModel.updateMany(
    { _id: { $in: winIds }, status: LUCKY_BOX_WIN_STATUS_ACTIVE },
    {
      $set: {
        status: LUCKY_BOX_WIN_STATUS_USED,
        usedInOrderId: orderId,
        usedAt: new Date(),
      },
    },
    { session },
  );
  if (result.matchedCount !== winIds.length) {
    throw new AppError(
      409,
      "Выигрыш в «Коробках удачи» уже использован в другом заказе",
    );
  }
}

/**
 * Сжечь выигрыши (товар-приз недоступен к моменту заказа) внутри
 * транзакции создания заказа. Трогает только still-active.
 */
export async function markLuckyBoxWinsExpired({ winIds, session }) {
  if (!Array.isArray(winIds) || winIds.length === 0) {
    return;
  }
  await SellerLuckyBoxWinModel.updateMany(
    { _id: { $in: winIds }, status: LUCKY_BOX_WIN_STATUS_ACTIVE },
    { $set: { status: LUCKY_BOX_WIN_STATUS_EXPIRED } },
    { session },
  );
}
