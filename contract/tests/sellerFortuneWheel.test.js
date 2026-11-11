import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FORTUNE_WHEEL_CHANCE_TOTAL,
  FORTUNE_WHEEL_DISCOUNT_PERCENT_MAX,
  FORTUNE_WHEEL_DISCOUNT_PERCENT_MIN,
  FORTUNE_WHEEL_DURATION_HOURS_MAX,
  FORTUNE_WHEEL_DURATION_HOURS_MIN,
  FORTUNE_WHEEL_SECTORS_MAX,
  FORTUNE_WHEEL_SECTORS_MIN,
  putFortuneWheelConfigBodySchema,
} from "../src/sellerFortuneWheel.js";

const validSector = { discountPercent: 10, durationHours: 12, chancePercent: 50 };

const buildSectors = (count, overrides = []) => {
  const base = Math.floor(FORTUNE_WHEEL_CHANCE_TOTAL / count);
  const remainder = FORTUNE_WHEEL_CHANCE_TOTAL - base * count;
  return Array.from({ length: count }, (_, index) => ({
    ...validSector,
    chancePercent: base + (index === count - 1 ? remainder : 0),
    ...(overrides[index] ?? {}),
  }));
};

describe("putFortuneWheelConfigBodySchema", () => {
  it("принимает конфиг с 2..8 секциями", () => {
    for (
      let count = FORTUNE_WHEEL_SECTORS_MIN;
      count <= FORTUNE_WHEEL_SECTORS_MAX;
      count += 1
    ) {
      const parsed = putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: buildSectors(count),
      });
      assert.equal(parsed.sectors.length, count);
    }
  });

  it("по умолчанию секция включена", () => {
    const parsed = putFortuneWheelConfigBodySchema.parse({
      enabled: true,
      sectors: buildSectors(2),
    });
    assert.equal(parsed.sectors[0].enabled, true);
  });

  it("отклоняет 1 и 9+ секций", () => {
    assert.throws(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: [{ ...validSector, chancePercent: 100 }],
      }),
    );
    assert.throws(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: Array.from({ length: FORTUNE_WHEEL_SECTORS_MAX + 1 }, () => ({
          ...validSector,
          chancePercent: 0,
        })),
      }),
    );
  });

  it("требует сумму шансов ровно 100%", () => {
    assert.doesNotThrow(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: [
          { ...validSector, chancePercent: 70 },
          { ...validSector, chancePercent: 30 },
        ],
      }),
    );
    assert.throws(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: [
          { ...validSector, chancePercent: 70 },
          { ...validSector, chancePercent: 20 },
        ],
      }),
    );
    assert.throws(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: [
          { ...validSector, chancePercent: 60 },
          { ...validSector, chancePercent: 60 },
        ],
      }),
    );
  });

  it("допускает шанс 0 (секция не выпадает) и 100", () => {
    assert.doesNotThrow(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: [
          { ...validSector, chancePercent: 100 },
          { ...validSector, chancePercent: 0 },
        ],
      }),
    );
    assert.throws(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: [
          { ...validSector, chancePercent: -1 },
          { ...validSector, chancePercent: 101 },
        ],
      }),
    );
  });

  it("включённая игра требует хотя бы одну призовую секцию", () => {
    assert.throws(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: buildSectors(2, [{ enabled: false }, { enabled: false }]),
      }),
    );
    // А выключенная игра может хранить все секции выключенными.
    assert.doesNotThrow(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: false,
        sectors: buildSectors(2, [{ enabled: false }, { enabled: false }]),
      }),
    );
  });

  it("границы скидки 1..90 включительно", () => {
    assert.doesNotThrow(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: buildSectors(2, [
          { discountPercent: FORTUNE_WHEEL_DISCOUNT_PERCENT_MIN },
          { discountPercent: FORTUNE_WHEEL_DISCOUNT_PERCENT_MAX },
        ]),
      }),
    );
    assert.throws(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: buildSectors(2, [{ discountPercent: 0 }]),
      }),
    );
    assert.throws(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: buildSectors(2, [{ discountPercent: 91 }]),
      }),
    );
  });

  it("границы срока 1..24 часа включительно", () => {
    assert.throws(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: buildSectors(2, [{ durationHours: 0 }]),
      }),
    );
    assert.throws(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: buildSectors(2, [
          { durationHours: FORTUNE_WHEEL_DURATION_HOURS_MAX + 1 },
        ]),
      }),
    );
    assert.doesNotThrow(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: false,
        sectors: buildSectors(2, [
          { durationHours: FORTUNE_WHEEL_DURATION_HOURS_MIN },
          { durationHours: FORTUNE_WHEEL_DURATION_HOURS_MAX },
        ]),
      }),
    );
  });

  it("требует enabled", () => {
    assert.throws(() =>
      putFortuneWheelConfigBodySchema.parse({ sectors: buildSectors(2) }),
    );
  });
});

describe("prizeProductId в секции", () => {
  it("по умолчанию null, принимает ObjectId и отклоняет мусор", () => {
    const parsedDefault = putFortuneWheelConfigBodySchema.parse({
      enabled: true,
      sectors: buildSectors(2),
    });
    assert.equal(parsedDefault.sectors[0].prizeProductId, null);

    const parsedWith = putFortuneWheelConfigBodySchema.parse({
      enabled: true,
      sectors: buildSectors(2, [
        { prizeProductId: "6af0c4bcb5658b01e9a19c8a" },
      ]),
    });
    assert.equal(
      parsedWith.sectors[0].prizeProductId,
      "6af0c4bcb5658b01e9a19c8a",
    );

    assert.throws(() =>
      putFortuneWheelConfigBodySchema.parse({
        enabled: true,
        sectors: buildSectors(2, [{ prizeProductId: "not-an-id" }]),
      }),
    );
  });
});
