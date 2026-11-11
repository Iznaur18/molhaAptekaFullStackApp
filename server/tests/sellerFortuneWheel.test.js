import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import {
  FORTUNE_WHEEL_ORDER_PROMO_CODE,
  FORTUNE_WHEEL_RESULT_EMPTY,
  FORTUNE_WHEEL_RESULT_WIN,
  FORTUNE_WHEEL_WIN_STATUS_ACTIVE,
  FORTUNE_WHEEL_WIN_STATUS_EXPIRED,
  FORTUNE_WHEEL_WIN_STATUS_USED,
} from "../constants/sellerFortuneWheelConstants.js";
import { AppError } from "../errors/AppError.js";
import {
  ProductModel,
  SellerFortuneWheelConfigModel,
  SellerFortuneWheelSpinModel,
  SellerFortuneWheelWinModel,
  UserModel,
} from "../models/index.js";
import { collectOrderedProductIdsWithPromo } from "../services/product/productPromoCode.js";
import {
  getMyFortuneWheelConfig,
  getSellerFortuneWheelState,
  listActiveFortuneWheelWinsForUser,
  listMyFortuneWheelWins,
  markFortuneWheelWinsUsed,
  putMyFortuneWheelConfig,
  spinSellerFortuneWheel,
} from "../services/seller-fortune-wheel/sellerFortuneWheel.js";
import { pickFortuneWheelSectorIndex } from "../services/seller-fortune-wheel/sellerFortuneWheelPick.js";
import { resolveMskDayKey } from "../services/seller-lucky-box/sellerLuckyBoxDayKey.js";
import { runInTransaction } from "../utils/mongoTransaction.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

const SECTORS = [
  { discountPercent: 10, durationHours: 12, chancePercent: 50, enabled: true },
  { discountPercent: 25, durationHours: 3, chancePercent: 30, enabled: true },
  { discountPercent: 5, durationHours: 6, chancePercent: 20, enabled: false },
];

before(async () => {
  await connectMongoTestReplSet();
  await SellerFortuneWheelConfigModel.syncIndexes();
  await SellerFortuneWheelSpinModel.syncIndexes();
  await SellerFortuneWheelWinModel.syncIndexes();
});

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

const createUser = (suffix) =>
  UserModel.create({
    userName: `fw_${suffix}`,
    email: `fw_${suffix}@test.local`,
    passwordHash: "hash",
  });

const createProduct = (sellerId, suffix, overrides = {}) =>
  ProductModel.create({
    productName: `FW Prize ${suffix}`,
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

const createEnabledConfig = (sellerId, sectors = SECTORS) =>
  SellerFortuneWheelConfigModel.create({
    sellerId,
    enabled: true,
    sectors,
  });

test("pickFortuneWheelSectorIndex: только секции с весом, границы соблюдены", () => {
  const sectors = [
    { chancePercent: 0 },
    { chancePercent: 30 },
    { chancePercent: 0 },
    { chancePercent: 70 },
  ];
  const hits = new Set();
  for (let run = 0; run < 500; run += 1) {
    const index = pickFortuneWheelSectorIndex(sectors);
    hits.add(index);
    assert.ok(index === 1 || index === 3);
  }
  // Обе живые секции за 500 прогонов выпадают.
  assert.deepEqual([...hits].sort(), [1, 3]);
});

test("pickFortuneWheelSectorIndex: все шансы нулевые — -1", () => {
  assert.equal(pickFortuneWheelSectorIndex([{ chancePercent: 0 }]), -1);
  assert.equal(pickFortuneWheelSectorIndex([]), -1);
});

test("collectOrderedProductIdsWithPromo: выигрыш FORTUNEWHEEL не считается промокодом", () => {
  const ids = collectOrderedProductIdsWithPromo([
    { productId: "p1", promoCodeAtOrder: "SALE10" },
    { productId: "p2", promoCodeAtOrder: FORTUNE_WHEEL_ORDER_PROMO_CODE },
    { productId: "p3", promoCodeAtOrder: null },
  ]);
  assert.deepEqual(ids, ["p1"]);
});

test("put/get конфига: upsert и снимок с шансами", async () => {
  const seller = await createUser("cfg_seller");

  const created = await putMyFortuneWheelConfig({
    sellerId: String(seller._id),
    body: { enabled: true, sectors: SECTORS },
  });
  assert.equal(created.config.enabled, true);
  assert.deepEqual(
    created.config.sectors,
    SECTORS.map((sector) => ({ ...sector, prizeProductId: null })),
  );

  const updated = await putMyFortuneWheelConfig({
    sellerId: String(seller._id),
    body: { enabled: false, sectors: SECTORS },
  });
  assert.equal(updated.config.enabled, false);

  const state = await getMyFortuneWheelConfig({ sellerId: String(seller._id) });
  assert.equal(state.config.enabled, false);
  assert.equal(state.config.sectors.length, SECTORS.length);
  assert.equal(state.config.sectors[0].chancePercent, SECTORS[0].chancePercent);
});

test("state: гость видит requiresAuth и секции с шансами", async () => {
  const seller = await createUser("state_seller");

  const disabled = await getSellerFortuneWheelState({
    sellerId: String(seller._id),
    buyerId: null,
  });
  assert.equal(disabled.enabled, false);

  await createEnabledConfig(seller._id);
  const guest = await getSellerFortuneWheelState({
    sellerId: String(seller._id),
    buyerId: null,
  });
  assert.equal(guest.enabled, true);
  assert.equal(guest.requiresAuth, true);
  assert.equal(guest.canSpin, false);
  assert.equal(guest.sectors.length, SECTORS.length);
  // Шанс виден всем: ширина секции на колесе ему пропорциональна.
  assert.equal(guest.sectors[0].chancePercent, SECTORS[0].chancePercent);
});

test("spin: секция из конфига, результат согласован с ней, второй спин — 409", async () => {
  const seller = await createUser("spin_seller");
  const buyer = await createUser("spin_buyer");
  await createEnabledConfig(seller._id);

  const result = await spinSellerFortuneWheel({
    sellerId: String(seller._id),
    buyerId: String(buyer._id),
  });

  assert.ok(result.sectorIndex >= 0 && result.sectorIndex < SECTORS.length);
  const sector = SECTORS[result.sectorIndex];
  const expectWin = sector.enabled !== false;
  assert.equal(
    result.result,
    expectWin ? FORTUNE_WHEEL_RESULT_WIN : FORTUNE_WHEEL_RESULT_EMPTY,
  );

  const spin = await SellerFortuneWheelSpinModel.findOne({
    sellerId: seller._id,
    buyerId: buyer._id,
  }).lean();
  assert.ok(spin);
  assert.equal(spin.sectorIndex, result.sectorIndex);
  assert.equal(spin.dayKey, resolveMskDayKey());

  if (expectWin) {
    assert.equal(result.prize.discountPercent, sector.discountPercent);
    assert.equal(result.prize.durationHours, sector.durationHours);
    const win = await SellerFortuneWheelWinModel.findOne({
      buyerId: buyer._id,
      sellerId: seller._id,
    }).lean();
    assert.ok(win);
    assert.equal(win.status, FORTUNE_WHEEL_WIN_STATUS_ACTIVE);
    assert.ok(win.expiresAt.getTime() > Date.now());
  } else {
    assert.equal(result.prize, null);
    assert.equal(
      await SellerFortuneWheelWinModel.countDocuments({ buyerId: buyer._id }),
      0,
    );
  }

  // Второй спин в тот же день — 409.
  await assert.rejects(
    spinSellerFortuneWheel({
      sellerId: String(seller._id),
      buyerId: String(buyer._id),
    }),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 409);
      return true;
    },
  );

  const state = await getSellerFortuneWheelState({
    sellerId: String(seller._id),
    buyerId: String(buyer._id),
  });
  assert.equal(state.canSpin, false);
  assert.equal(state.todaySpin.sectorIndex, result.sectorIndex);
  assert.equal(state.todaySpin.result, result.result);

  const configAfter = await SellerFortuneWheelConfigModel.findOne({
    sellerId: seller._id,
  }).lean();
  assert.equal(configAfter.spinsTotal, 1);
  assert.equal(configAfter.winsTotal, expectWin ? 1 : 0);
});

test("spin: пустая секция не даёт выигрыша", async () => {
  const seller = await createUser("empty_seller");
  const buyer = await createUser("empty_buyer");
  // Единственная живая секция — пустая с шансом 100%.
  await createEnabledConfig(seller._id, [
    { discountPercent: 10, durationHours: 12, chancePercent: 0, enabled: true },
    { discountPercent: 5, durationHours: 6, chancePercent: 100, enabled: false },
  ]);

  const result = await spinSellerFortuneWheel({
    sellerId: String(seller._id),
    buyerId: String(buyer._id),
  });
  assert.equal(result.sectorIndex, 1);
  assert.equal(result.result, FORTUNE_WHEEL_RESULT_EMPTY);
  assert.equal(result.prize, null);
  assert.equal(
    await SellerFortuneWheelWinModel.countDocuments({ buyerId: buyer._id }),
    0,
  );
});

// TODO(self-play): временный сценарий для приёмки — убрать вместе с
// isSelfPlayReplayAllowed, когда self-play отключим.
test("spin: у себя на витрине вне прода день перекручивается", async () => {
  const seller = await createUser("self_seller");
  await createEnabledConfig(seller._id);

  const countOwnSpins = () =>
    SellerFortuneWheelSpinModel.countDocuments({
      sellerId: seller._id,
      buyerId: seller._id,
    });

  const first = await spinSellerFortuneWheel({
    sellerId: String(seller._id),
    buyerId: String(seller._id),
  });
  assert.ok(first.sectorIndex >= 0);
  assert.equal(await countOwnSpins(), 1);

  // Следующий спин сбрасывает день: снова один спин в базе.
  const replay = await spinSellerFortuneWheel({
    sellerId: String(seller._id),
    buyerId: String(seller._id),
  });
  assert.ok(replay.sectorIndex >= 0);
  assert.equal(await countOwnSpins(), 1);

  const state = await getSellerFortuneWheelState({
    sellerId: String(seller._id),
    buyerId: String(seller._id),
  });
  assert.equal(state.canSpin, true);
  assert.equal(state.todaySpin, undefined);
});

test("spin: выключенная игра — 409", async () => {
  const seller = await createUser("off_seller");
  const buyer = await createUser("off_buyer");
  await SellerFortuneWheelConfigModel.create({
    sellerId: seller._id,
    enabled: false,
    sectors: SECTORS,
  });
  await assert.rejects(
    spinSellerFortuneWheel({
      sellerId: String(seller._id),
      buyerId: String(buyer._id),
    }),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 409);
      return true;
    },
  );
});

test("spin: все секции пустые при включённой игре — 409", async () => {
  const seller = await createUser("none_seller");
  const buyer = await createUser("none_buyer");
  await SellerFortuneWheelConfigModel.create({
    sellerId: seller._id,
    enabled: true,
    sectors: [
      { discountPercent: 10, durationHours: 12, chancePercent: 60, enabled: false },
      { discountPercent: 25, durationHours: 3, chancePercent: 40, enabled: false },
    ],
  });
  await assert.rejects(
    spinSellerFortuneWheel({
      sellerId: String(seller._id),
      buyerId: String(buyer._id),
    }),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 409);
      return true;
    },
  );
});

test("listMyFortuneWheelWins: активные отдаёт, просроченные помечает expired", async () => {
  const seller = await createUser("wins_seller");
  const buyer = await createUser("wins_buyer");
  const spin = await SellerFortuneWheelSpinModel.create({
    sellerId: seller._id,
    buyerId: buyer._id,
    dayKey: resolveMskDayKey(),
    sectorIndex: 0,
    result: FORTUNE_WHEEL_RESULT_WIN,
    prizeSnapshot: SECTORS[0],
  });

  await SellerFortuneWheelWinModel.create({
    buyerId: buyer._id,
    sellerId: seller._id,
    discountPercent: 10,
    durationHours: 12,
    expiresAt: new Date(Date.now() + 3_600_000),
    spinId: spin._id,
  });
  await SellerFortuneWheelWinModel.create({
    buyerId: buyer._id,
    sellerId: seller._id,
    discountPercent: 5,
    durationHours: 1,
    expiresAt: new Date(Date.now() - 1_000),
    spinId: spin._id,
  });

  const { wins } = await listMyFortuneWheelWins({ buyerId: String(buyer._id) });
  assert.equal(wins.length, 1);
  assert.equal(wins[0].discountPercent, 10);
  assert.equal(wins[0].sellerId, String(seller._id));

  const expired = await SellerFortuneWheelWinModel.findOne({
    buyerId: buyer._id,
    discountPercent: 5,
  }).lean();
  assert.equal(expired.status, FORTUNE_WHEEL_WIN_STATUS_EXPIRED);
});

test("markFortuneWheelWinsUsed: помечает в транзакции, повторный вызов — 409", async () => {
  const seller = await createUser("mark_seller");
  const buyer = await createUser("mark_buyer");
  const spin = await SellerFortuneWheelSpinModel.create({
    sellerId: seller._id,
    buyerId: buyer._id,
    dayKey: resolveMskDayKey(),
    sectorIndex: 0,
    result: FORTUNE_WHEEL_RESULT_WIN,
    prizeSnapshot: SECTORS[0],
  });
  const win = await SellerFortuneWheelWinModel.create({
    buyerId: buyer._id,
    sellerId: seller._id,
    discountPercent: 10,
    durationHours: 12,
    expiresAt: new Date(Date.now() + 3_600_000),
    spinId: spin._id,
  });

  const orderId = spin._id; // любой ObjectId для связи
  await runInTransaction(async (session) => {
    await markFortuneWheelWinsUsed({ winIds: [win._id], orderId, session });
  });

  const marked = await SellerFortuneWheelWinModel.findById(win._id).lean();
  assert.equal(marked.status, FORTUNE_WHEEL_WIN_STATUS_USED);
  assert.equal(String(marked.usedInOrderId), String(orderId));
  assert.ok(marked.usedAt instanceof Date);

  // Повторный вызов по уже использованному выигрышу — 409 (защита от
  // двойного расходования при гонке заказов), статус не меняется.
  await assert.rejects(
    runInTransaction(async (session) => {
      await markFortuneWheelWinsUsed({ winIds: [win._id], orderId, session });
    }),
    (error) => error?.statusCode === 409,
  );
  const afterSecond = await SellerFortuneWheelWinModel.findById(win._id).lean();
  assert.equal(afterSecond.status, FORTUNE_WHEEL_WIN_STATUS_USED);

  // И used-выигрыш больше не «активен» для createOrder.
  const active = await listActiveFortuneWheelWinsForUser({
    userId: String(buyer._id),
  });
  assert.equal(active.length, 0);
});

test("putMyFortuneWheelConfig: товар-приз — только свой товар", async () => {
  const seller = await createUser("prize_seller");
  const other = await createUser("prize_other");
  const ownProduct = await createProduct(seller._id, "own");
  const foreignProduct = await createProduct(other._id, "foreign");

  const sectorsWith = (prizeProductId) => [
    {
      discountPercent: 10,
      durationHours: 12,
      chancePercent: 100,
      enabled: true,
      prizeProductId,
    },
    { discountPercent: 5, durationHours: 6, chancePercent: 0, enabled: false },
  ];

  // Несуществующий товар — 400.
  await assert.rejects(
    putMyFortuneWheelConfig({
      sellerId: String(seller._id),
      body: {
        enabled: true,
        sectors: sectorsWith(String(seller._id)), // валидный ObjectId, но не товар
      },
    }),
    (error) => error?.statusCode === 400,
  );

  // Чужой товар — 400.
  await assert.rejects(
    putMyFortuneWheelConfig({
      sellerId: String(seller._id),
      body: { enabled: true, sectors: sectorsWith(String(foreignProduct._id)) },
    }),
    (error) => error?.statusCode === 400,
  );

  // Свой товар — сохраняется с prizeProductId.
  const saved = await putMyFortuneWheelConfig({
    sellerId: String(seller._id),
    body: { enabled: true, sectors: sectorsWith(String(ownProduct._id)) },
  });
  assert.equal(saved.config.sectors[0].prizeProductId, String(ownProduct._id));
  assert.equal(saved.config.sectors[1].prizeProductId, null);
});

test("spin: секция с товаром-призом даёт выигрыш с prizeProductId и именем", async () => {
  const seller = await createUser("prize_spin_seller");
  const buyer = await createUser("prize_spin_buyer");
  const product = await createProduct(seller._id, "spin");
  await createEnabledConfig(seller._id, [
    {
      discountPercent: 10,
      durationHours: 12,
      chancePercent: 100,
      enabled: true,
      prizeProductId: product._id,
    },
    { discountPercent: 5, durationHours: 6, chancePercent: 0, enabled: false },
  ]);

  const result = await spinSellerFortuneWheel({
    sellerId: String(seller._id),
    buyerId: String(buyer._id),
  });

  assert.equal(result.result, FORTUNE_WHEEL_RESULT_WIN);
  assert.equal(result.prize.prizeProductId, String(product._id));
  assert.equal(result.prize.prizeProductName, product.productName);

  const win = await SellerFortuneWheelWinModel.findOne({
    sellerId: seller._id,
    buyerId: buyer._id,
  }).lean();
  assert.equal(String(win.prizeProductId), String(product._id));
  assert.equal(win.prizeProductName, product.productName);

  // И в списке активных выигрышей для createOrder товар виден.
  const active = await listActiveFortuneWheelWinsForUser({
    userId: String(buyer._id),
  });
  assert.equal(String(active[0].prizeProductId), String(product._id));
});
