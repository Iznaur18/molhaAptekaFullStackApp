import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import {
  LUCKY_BOX_ATTEMPTS_PER_DAY,
  LUCKY_BOX_BOXES_TOTAL,
  LUCKY_BOX_ORDER_PROMO_CODE,
  LUCKY_BOX_PRIZES_MAX,
  LUCKY_BOX_PRIZES_MIN,
  LUCKY_BOX_RESULT_EMPTY,
  LUCKY_BOX_RESULT_WIN,
  LUCKY_BOX_WIN_STATUS_ACTIVE,
  LUCKY_BOX_WIN_STATUS_EXPIRED,
  LUCKY_BOX_WIN_STATUS_USED,
} from "../constants/sellerLuckyBoxConstants.js";
import { AppError } from "../errors/AppError.js";
import {
  ProductModel,
  SellerLuckyBoxConfigModel,
  SellerLuckyBoxPlayModel,
  SellerLuckyBoxWinModel,
  UserModel,
} from "../models/index.js";
import { collectOrderedProductIdsWithPromo } from "../services/product/productPromoCode.js";
import {
  getMyLuckyBoxConfig,
  getSellerLuckyBoxState,
  listActiveLuckyBoxWinsForUser,
  listMyLuckyBoxWins,
  markLuckyBoxWinsUsed,
  playSellerLuckyBox,
  putMyLuckyBoxConfig,
} from "../services/seller-lucky-box/sellerLuckyBox.js";
import { resolveMskDayKey } from "../services/seller-lucky-box/sellerLuckyBoxDayKey.js";
import { generateLuckyBoxLayout } from "../services/seller-lucky-box/sellerLuckyBoxLayout.js";
import { runInTransaction } from "../utils/mongoTransaction.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

const PRIZES = [
  { discountPercent: 10, durationHours: 12, enabled: true },
  { discountPercent: 25, durationHours: 3, enabled: true },
];

before(async () => {
  await connectMongoTestReplSet();
  await SellerLuckyBoxConfigModel.syncIndexes();
  await SellerLuckyBoxPlayModel.syncIndexes();
  await SellerLuckyBoxWinModel.syncIndexes();
});

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

const createUser = (suffix) =>
  UserModel.create({
    userName: `lb_${suffix}`,
    email: `lb_${suffix}@test.local`,
    passwordHash: "hash",
  });

const createProduct = (sellerId, suffix, overrides = {}) =>
  ProductModel.create({
    productName: `LB Prize ${suffix}`,
    productDescription: "Test product description",
    productPrice: 1000,
    productSeller: sellerId,
    productCategory: "grocery",
    productStockQuantity: 10,
    productModerationStatus: "approved",
    productPickupAddress: "Москва, Тверская улица, д 1",
    productDeliveryEnabled: false,
    ...overrides,
  });

const createEnabledConfig = (sellerId) =>
  SellerLuckyBoxConfigModel.create({
    sellerId,
    enabled: true,
    prizes: PRIZES,
  });

test("generateLuckyBoxLayout: count уникальных позиций 0..5, зажат в 1..4", () => {
  for (let run = 0; run < 300; run += 1) {
    for (const count of [0, 1, 2, 3, 4, 5, 99]) {
      const layout = generateLuckyBoxLayout(count);
      const expected = Math.min(
        LUCKY_BOX_PRIZES_MAX,
        Math.max(LUCKY_BOX_PRIZES_MIN, count),
      );
      assert.equal(layout.length, expected);
      assert.equal(new Set(layout).size, expected);
      for (const position of layout) {
        assert.ok(Number.isInteger(position));
        assert.ok(position >= 0 && position < LUCKY_BOX_BOXES_TOTAL);
      }
    }
  }
});

test("resolveMskDayKey: день считается по Europe/Moscow", () => {
  // 21:30 UTC = 00:30 МСК следующих суток.
  assert.equal(resolveMskDayKey(new Date("2026-11-10T21:30:00.000Z")), "2026-11-11");
  assert.equal(resolveMskDayKey(new Date("2026-11-10T20:59:59.000Z")), "2026-11-10");
});

test("collectOrderedProductIdsWithPromo: выигрыш LUCKYBOX не считается промокодом", () => {
  const ids = collectOrderedProductIdsWithPromo([
    { productId: "p1", promoCodeAtOrder: "SALE10" },
    { productId: "p2", promoCodeAtOrder: LUCKY_BOX_ORDER_PROMO_CODE },
    { productId: "p3", promoCodeAtOrder: null },
  ]);
  assert.deepEqual(ids, ["p1"]);
});

test("put/get конфига: upsert и снимок", async () => {
  const seller = await createUser("cfg_seller");

  const created = await putMyLuckyBoxConfig({
    sellerId: String(seller._id),
    body: { enabled: true, prizes: PRIZES },
  });
  assert.equal(created.config.enabled, true);
  assert.deepEqual(
    created.config.prizes,
    PRIZES.map((prize) => ({ ...prize, prizeProductId: null })),
  );

  const updated = await putMyLuckyBoxConfig({
    sellerId: String(seller._id),
    body: { enabled: false, prizes: PRIZES },
  });
  assert.equal(updated.config.enabled, false);

  const state = await getMyLuckyBoxConfig({ sellerId: String(seller._id) });
  assert.equal(state.config.enabled, false);
  assert.equal(state.config.prizes.length, PRIZES.length);
});

test("state: гость видит requiresAuth, при выключенной игре — enabled:false", async () => {
  const seller = await createUser("state_seller");

  const disabled = await getSellerLuckyBoxState({
    sellerId: String(seller._id),
    buyerId: null,
  });
  assert.equal(disabled.enabled, false);

  await createEnabledConfig(seller._id);
  const guest = await getSellerLuckyBoxState({
    sellerId: String(seller._id),
    buyerId: null,
  });
  assert.equal(guest.enabled, true);
  assert.equal(guest.requiresAuth, true);
  assert.equal(guest.canPlay, false);
  // Раскладку гостю не отдаём.
  assert.equal("layout" in guest, false);
});

test("play: результат согласован с раскладкой, лимит двух попыток", async () => {
  const seller = await createUser("play_seller");
  const buyer = await createUser("play_buyer");
  await createEnabledConfig(seller._id);

  const boxIndex = 2;
  const result = await playSellerLuckyBox({
    sellerId: String(seller._id),
    buyerId: String(buyer._id),
    boxIndex,
  });

  assert.equal(result.pickedBoxIndex, boxIndex);
  assert.equal(result.attemptsTotal, LUCKY_BOX_ATTEMPTS_PER_DAY);

  const play = await SellerLuckyBoxPlayModel.findOne({
    sellerId: seller._id,
    buyerId: buyer._id,
  }).lean();
  assert.ok(play);
  assert.equal(play.attemptIndex, 1);
  assert.equal(play.result, result.result);
  assert.equal(play.layout.length, PRIZES.length);
  const expectWin = play.layout.includes(boxIndex);
  assert.equal(
    result.result,
    expectWin ? LUCKY_BOX_RESULT_WIN : LUCKY_BOX_RESULT_EMPTY,
  );

  if (expectWin) {
    // Выигрыш: раскладку раскрыли, попытки закончились.
    assert.deepEqual(result.layout, play.layout);
    assert.deepEqual(
      result.layoutPrizes,
      play.layout.map((box, i) => ({
        boxIndex: box,
        discountPercent: play.layoutPrizePercents[i],
        prizeProductId: null,
        prizeProductName: null,
      })),
    );
    assert.equal(result.attemptsLeft, 0);
    const prizeIndex = play.layout.indexOf(boxIndex);
    const expectedPrize = PRIZES[prizeIndex];
    assert.equal(result.prize.discountPercent, expectedPrize.discountPercent);
    assert.equal(result.prize.durationHours, expectedPrize.durationHours);
    const win = await SellerLuckyBoxWinModel.findOne({
      buyerId: buyer._id,
      sellerId: seller._id,
    }).lean();
    assert.ok(win);
    assert.equal(win.status, LUCKY_BOX_WIN_STATUS_ACTIVE);
    assert.ok(win.expiresAt.getTime() > Date.now());

    await assert.rejects(
      playSellerLuckyBox({
        sellerId: String(seller._id),
        buyerId: String(buyer._id),
        boxIndex: 0,
      }),
      (error) => {
        assert.ok(error instanceof AppError);
        assert.equal(error.statusCode, 409);
        return true;
      },
    );

    const state = await getSellerLuckyBoxState({
      sellerId: String(seller._id),
      buyerId: String(buyer._id),
    });
    assert.equal(state.canPlay, false);
    assert.equal(state.attemptsUsed, 1);
    assert.equal(state.todayPlays.length, 1);
    assert.equal(state.todayPlays[0].result, LUCKY_BOX_RESULT_WIN);
    assert.deepEqual(state.todayPlays[0].layout, play.layout);
  } else {
    // Пусто: раскладка скрыта, вторая попытка есть.
    assert.equal(result.layout, null);
    assert.equal(result.layoutPrizes, null);
    assert.equal(result.attemptsLeft, 1);
    assert.equal(result.prize, null);
    assert.equal(
      await SellerLuckyBoxWinModel.countDocuments({ buyerId: buyer._id }),
      0,
    );

    const midState = await getSellerLuckyBoxState({
      sellerId: String(seller._id),
      buyerId: String(buyer._id),
    });
    assert.equal(midState.canPlay, true);
    assert.equal(midState.attemptsUsed, 1);
    assert.equal(midState.todayPlays[0].layout, null);

    // Ту же коробку второй раз открыть нельзя.
    await assert.rejects(
      playSellerLuckyBox({
        sellerId: String(seller._id),
        buyerId: String(buyer._id),
        boxIndex,
      }),
      (error) => {
        assert.ok(error instanceof AppError);
        assert.equal(error.statusCode, 409);
        return true;
      },
    );

    // Вторая попытка — по другой коробке, раскладка дня та же.
    const secondBox = (boxIndex + 1) % 6;
    const second = await playSellerLuckyBox({
      sellerId: String(seller._id),
      buyerId: String(buyer._id),
      boxIndex: secondBox,
    });
    assert.equal(second.attemptsLeft, 0);
    assert.deepEqual(second.layout, play.layout);
    assert.deepEqual(
      second.layoutPrizes,
      play.layout.map((box, i) => ({
        boxIndex: box,
        discountPercent: play.layoutPrizePercents[i],
        prizeProductId: null,
        prizeProductName: null,
      })),
    );

    // Третьей попытки нет.
    await assert.rejects(
      playSellerLuckyBox({
        sellerId: String(seller._id),
        buyerId: String(buyer._id),
        boxIndex: (boxIndex + 2) % 6,
      }),
      (error) => {
        assert.ok(error instanceof AppError);
        assert.equal(error.statusCode, 409);
        return true;
      },
    );

    const state = await getSellerLuckyBoxState({
      sellerId: String(seller._id),
      buyerId: String(buyer._id),
    });
    assert.equal(state.canPlay, false);
    assert.equal(state.attemptsUsed, 2);
    assert.equal(state.todayPlays.length, 2);
    assert.deepEqual(state.todayPlays[0].layout, play.layout);
  }

  const configAfter = await SellerLuckyBoxConfigModel.findOne({
    sellerId: seller._id,
  }).lean();
  assert.equal(configAfter.playsTotal, expectWin ? 1 : 2);
});

test("play: после пустой первой попытки раскладка дня сохраняется", async () => {
  const seller = await createUser("layout_seller");
  const buyer = await createUser("layout_buyer");
  await createEnabledConfig(seller._id);

  // Первая попытка дня — гарантированно пустая, раскладка известна.
  await SellerLuckyBoxPlayModel.create({
    sellerId: seller._id,
    buyerId: buyer._id,
    dayKey: resolveMskDayKey(),
    attemptIndex: 1,
    layout: [1, 3],
    pickedBoxIndex: 0,
    result: LUCKY_BOX_RESULT_EMPTY,
    prizeSnapshot: null,
  });

  // Вторая попытка по призовой коробке выигрывает приз раскладки [1, 3].
  const won = await playSellerLuckyBox({
    sellerId: String(seller._id),
    buyerId: String(buyer._id),
    boxIndex: 3,
  });
  assert.equal(won.result, LUCKY_BOX_RESULT_WIN);
  assert.deepEqual(won.layout, [1, 3]);
  assert.equal(won.prize.discountPercent, PRIZES[1].discountPercent);
  // По завершении раскрываем и скидки каждой призовой коробки.
  assert.deepEqual(won.layoutPrizes, [
    {
      boxIndex: 1,
      discountPercent: PRIZES[0].discountPercent,
      prizeProductId: null,
      prizeProductName: null,
    },
    {
      boxIndex: 3,
      discountPercent: PRIZES[1].discountPercent,
      prizeProductId: null,
      prizeProductName: null,
    },
  ]);

  const plays = await SellerLuckyBoxPlayModel.find({
    sellerId: seller._id,
    buyerId: buyer._id,
  })
    .sort({ attemptIndex: 1 })
    .lean();
  assert.equal(plays.length, 2);
  assert.equal(plays[1].attemptIndex, 2);
  assert.deepEqual(plays[1].layout, [1, 3]);
});

test("play: после выигрыша второй попытки нет", async () => {
  const seller = await createUser("won_seller");
  const buyer = await createUser("won_buyer");
  await createEnabledConfig(seller._id);

  await SellerLuckyBoxPlayModel.create({
    sellerId: seller._id,
    buyerId: buyer._id,
    dayKey: resolveMskDayKey(),
    attemptIndex: 1,
    layout: [1, 3],
    pickedBoxIndex: 1,
    result: LUCKY_BOX_RESULT_WIN,
    prizeSnapshot: PRIZES[0],
  });

  await assert.rejects(
    playSellerLuckyBox({
      sellerId: String(seller._id),
      buyerId: String(buyer._id),
      boxIndex: 3,
    }),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 409);
      assert.match(error.message, /выиграли/);
      return true;
    },
  );

  const state = await getSellerLuckyBoxState({
    sellerId: String(seller._id),
    buyerId: String(buyer._id),
  });
  assert.equal(state.canPlay, false);
  assert.equal(state.attemptsUsed, 1);
});

// TODO(self-play): временный сценарий для приёмки — убрать вместе с
// isSelfPlayReplayAllowed, когда self-play отключим.
test("play: у себя на витрине вне прода исчерпанный день переигрывается", async () => {
  const seller = await createUser("self_seller");
  await createEnabledConfig(seller._id);

  const countOwnPlays = () =>
    SellerLuckyBoxPlayModel.countDocuments({
      sellerId: seller._id,
      buyerId: seller._id,
    });

  // День играется как обычно: первая попытка, при пустой — вторая.
  const first = await playSellerLuckyBox({
    sellerId: String(seller._id),
    buyerId: String(seller._id),
    boxIndex: 0,
  });
  assert.equal(first.pickedBoxIndex, 0);

  if (first.result === LUCKY_BOX_RESULT_EMPTY) {
    const second = await playSellerLuckyBox({
      sellerId: String(seller._id),
      buyerId: String(seller._id),
      boxIndex: 1,
    });
    assert.equal(second.pickedBoxIndex, 1);
    assert.equal(await countOwnPlays(), 2);
  } else {
    assert.equal(await countOwnPlays(), 1);
  }

  // День исчерпан (выигрыш или обе попытки) — следующая игра его сбрасывает.
  const replay = await playSellerLuckyBox({
    sellerId: String(seller._id),
    buyerId: String(seller._id),
    boxIndex: 5,
  });
  assert.equal(replay.pickedBoxIndex, 5);
  assert.equal(await countOwnPlays(), 1);

  // …и выигрыши прошлых self-попыток зачищены: живёт разве что выигрыш
  // последней попытки.
  assert.equal(
    await SellerLuckyBoxWinModel.countDocuments({ buyerId: seller._id }),
    replay.result === LUCKY_BOX_RESULT_WIN ? 1 : 0,
  );

  const state = await getSellerLuckyBoxState({
    sellerId: String(seller._id),
    buyerId: String(seller._id),
  });
  assert.equal(state.canPlay, true);
  assert.equal(state.todayPlays, undefined);
});

test("play: выключенная игра — 409", async () => {
  const seller = await createUser("off_seller");
  const buyer = await createUser("off_buyer");
  await SellerLuckyBoxConfigModel.create({
    sellerId: seller._id,
    enabled: false,
    prizes: PRIZES,
  });
  await assert.rejects(
    playSellerLuckyBox({
      sellerId: String(seller._id),
      buyerId: String(buyer._id),
      boxIndex: 0,
    }),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 409);
      return true;
    },
  );
});

test("play: выключенные призы не попадают в раскладку, prizesTotal их не считает", async () => {
  const seller = await createUser("disabled_seller");
  const buyer = await createUser("disabled_buyer");
  await SellerLuckyBoxConfigModel.create({
    sellerId: seller._id,
    enabled: true,
    prizes: [
      { discountPercent: 10, durationHours: 12, enabled: false },
      { discountPercent: 25, durationHours: 3, enabled: false },
      { discountPercent: 40, durationHours: 6, enabled: true },
    ],
  });

  // В раскладке ровно одна призовая коробка — единственный включённый приз.
  const result = await playSellerLuckyBox({
    sellerId: String(seller._id),
    buyerId: String(buyer._id),
    boxIndex: 0,
  });
  const play = await SellerLuckyBoxPlayModel.findOne({
    sellerId: seller._id,
    buyerId: buyer._id,
  }).lean();
  assert.equal(play.layout.length, 1);
  if (result.result === LUCKY_BOX_RESULT_WIN) {
    assert.equal(result.prize.discountPercent, 40);
  }

  const buyer2 = await createUser("disabled_buyer2");
  const state = await getSellerLuckyBoxState({
    sellerId: String(seller._id),
    buyerId: String(buyer2._id),
  });
  assert.equal(state.prizesTotal, 1);

  // Все призы выключены при включённой игре — 409.
  const seller2 = await createUser("none_seller");
  await SellerLuckyBoxConfigModel.create({
    sellerId: seller2._id,
    enabled: true,
    prizes: [{ discountPercent: 10, durationHours: 12, enabled: false }],
  });
  await assert.rejects(
    playSellerLuckyBox({
      sellerId: String(seller2._id),
      buyerId: String(buyer2._id),
      boxIndex: 0,
    }),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 409);
      return true;
    },
  );
});

test("listMyLuckyBoxWins: активные отдаёт, просроченные помечает expired", async () => {
  const seller = await createUser("wins_seller");
  const buyer = await createUser("wins_buyer");
  const play = await SellerLuckyBoxPlayModel.create({
    sellerId: seller._id,
    buyerId: buyer._id,
    dayKey: resolveMskDayKey(),
    layout: [0, 1],
    pickedBoxIndex: 0,
    result: LUCKY_BOX_RESULT_WIN,
    prizeSnapshot: PRIZES[0],
  });

  await SellerLuckyBoxWinModel.create({
    buyerId: buyer._id,
    sellerId: seller._id,
    discountPercent: 10,
    durationHours: 12,
    expiresAt: new Date(Date.now() + 3_600_000),
    playId: play._id,
  });
  await SellerLuckyBoxWinModel.create({
    buyerId: buyer._id,
    sellerId: seller._id,
    discountPercent: 5,
    durationHours: 1,
    expiresAt: new Date(Date.now() - 1_000),
    playId: play._id,
  });

  const { wins } = await listMyLuckyBoxWins({ buyerId: String(buyer._id) });
  assert.equal(wins.length, 1);
  assert.equal(wins[0].discountPercent, 10);
  assert.equal(wins[0].sellerId, String(seller._id));

  const expired = await SellerLuckyBoxWinModel.findOne({
    buyerId: buyer._id,
    discountPercent: 5,
  }).lean();
  assert.equal(expired.status, LUCKY_BOX_WIN_STATUS_EXPIRED);
});

test("markLuckyBoxWinsUsed: помечает в транзакции, повторный вызов — 409", async () => {
  const seller = await createUser("mark_seller");
  const buyer = await createUser("mark_buyer");
  const play = await SellerLuckyBoxPlayModel.create({
    sellerId: seller._id,
    buyerId: buyer._id,
    dayKey: resolveMskDayKey(),
    layout: [0, 1],
    pickedBoxIndex: 0,
    result: LUCKY_BOX_RESULT_WIN,
    prizeSnapshot: PRIZES[0],
  });
  const win = await SellerLuckyBoxWinModel.create({
    buyerId: buyer._id,
    sellerId: seller._id,
    discountPercent: 10,
    durationHours: 12,
    expiresAt: new Date(Date.now() + 3_600_000),
    playId: play._id,
  });

  const orderId = play._id; // любой ObjectId для связи
  await runInTransaction(async (session) => {
    await markLuckyBoxWinsUsed({ winIds: [win._id], orderId, session });
  });

  const marked = await SellerLuckyBoxWinModel.findById(win._id).lean();
  assert.equal(marked.status, LUCKY_BOX_WIN_STATUS_USED);
  assert.equal(String(marked.usedInOrderId), String(orderId));
  assert.ok(marked.usedAt instanceof Date);

  // Повторный вызов по уже использованному выигрышу — 409 (защита от
  // двойного расходования при гонке заказов), статус не меняется.
  await assert.rejects(
    runInTransaction(async (session) => {
      await markLuckyBoxWinsUsed({ winIds: [win._id], orderId, session });
    }),
    (error) => error?.statusCode === 409,
  );
  const afterSecond = await SellerLuckyBoxWinModel.findById(win._id).lean();
  assert.equal(afterSecond.status, LUCKY_BOX_WIN_STATUS_USED);

  // И used-выигрыш больше не «активен» для createOrder.
  const active = await listActiveLuckyBoxWinsForUser({
    userId: String(buyer._id),
  });
  assert.equal(active.length, 0);
});

test("putMyLuckyBoxConfig: товар-приз — только свой товар", async () => {
  const seller = await createUser("prize_seller");
  const other = await createUser("prize_other");
  const ownProduct = await createProduct(seller._id, "own");
  const foreignProduct = await createProduct(other._id, "foreign");

  const prizesWith = (prizeProductId) => [
    { discountPercent: 10, durationHours: 12, enabled: true, prizeProductId },
  ];

  await assert.rejects(
    putMyLuckyBoxConfig({
      sellerId: String(seller._id),
      body: { enabled: true, prizes: prizesWith(String(seller._id)) },
    }),
    (error) => error?.statusCode === 400,
  );

  await assert.rejects(
    putMyLuckyBoxConfig({
      sellerId: String(seller._id),
      body: { enabled: true, prizes: prizesWith(String(foreignProduct._id)) },
    }),
    (error) => error?.statusCode === 400,
  );

  const saved = await putMyLuckyBoxConfig({
    sellerId: String(seller._id),
    body: { enabled: true, prizes: prizesWith(String(ownProduct._id)) },
  });
  assert.equal(saved.config.prizes[0].prizeProductId, String(ownProduct._id));
});

test("play: приз с товаром даёт выигрыш с prizeProductId и именем", async () => {
  const seller = await createUser("prize_play_seller");
  const product = await createProduct(seller._id, "play");
  await SellerLuckyBoxConfigModel.create({
    sellerId: seller._id,
    enabled: true,
    // 4 призовые коробки из 6: промах одного покупателя — 1/15, пяти
    // покупателей подряд — ~1e-6. Раскладка у каждого покупателя своя,
    // поэтому детерминированно «все 6 коробок» не покрыть.
    prizes: Array.from({ length: 4 }, () => ({
      discountPercent: 10,
      durationHours: 12,
      enabled: true,
      prizeProductId: product._id,
    })),
  });

  let won = null;
  let winnerId = null;
  for (let buyerIndex = 0; buyerIndex < 5 && !won; buyerIndex += 1) {
    const buyer = await createUser(`prize_play_buyer_${buyerIndex}`);
    for (
      let boxIndex = buyerIndex * 2;
      boxIndex < buyerIndex * 2 + 2 && !won;
      boxIndex += 1
    ) {
      const result = await playSellerLuckyBox({
        sellerId: String(seller._id),
        buyerId: String(buyer._id),
        boxIndex,
      });
      if (result.result === LUCKY_BOX_RESULT_WIN) {
        won = result;
        winnerId = buyer._id;
      }
    }
  }

  assert.ok(won, "ожидали выигрыш с единственным призом");
  assert.equal(won.prize.prizeProductId, String(product._id));
  assert.equal(won.prize.prizeProductName, product.productName);

  const win = await SellerLuckyBoxWinModel.findOne({
    sellerId: seller._id,
    buyerId: winnerId,
  }).lean();
  assert.equal(String(win.prizeProductId), String(product._id));
  assert.equal(win.prizeProductName, product.productName);
});
