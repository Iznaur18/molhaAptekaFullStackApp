import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  LUCKY_BOX_BOXES_TOTAL,
  LUCKY_BOX_DISCOUNT_PERCENT_MAX,
  LUCKY_BOX_DISCOUNT_PERCENT_MIN,
  LUCKY_BOX_DURATION_HOURS_MAX,
  LUCKY_BOX_DURATION_HOURS_MIN,
  LUCKY_BOX_PRIZES_MAX,
  LUCKY_BOX_PRIZES_MIN,
  playLuckyBoxBodySchema,
  putLuckyBoxConfigBodySchema,
} from "../src/sellerLuckyBox.js";

const validPrize = { discountPercent: 10, durationHours: 12 };

describe("putLuckyBoxConfigBodySchema", () => {
  it("принимает конфиг с 1..4 призами", () => {
    for (let count = LUCKY_BOX_PRIZES_MIN; count <= LUCKY_BOX_PRIZES_MAX; count += 1) {
      const parsed = putLuckyBoxConfigBodySchema.parse({
        enabled: true,
        prizes: Array.from({ length: count }, () => validPrize),
      });
      assert.equal(parsed.prizes.length, count);
    }
  });

  it("по умолчанию приз включён", () => {
    const parsed = putLuckyBoxConfigBodySchema.parse({
      enabled: true,
      prizes: [validPrize],
    });
    assert.equal(parsed.prizes[0].enabled, true);
  });

  it("отклоняет 0 и 5+ призов", () => {
    assert.throws(() =>
      putLuckyBoxConfigBodySchema.parse({ enabled: true, prizes: [] }),
    );
    assert.throws(() =>
      putLuckyBoxConfigBodySchema.parse({
        enabled: true,
        prizes: Array.from({ length: LUCKY_BOX_PRIZES_MAX + 1 }, () => validPrize),
      }),
    );
  });

  it("включённая игра требует хотя бы один включённый приз", () => {
    assert.throws(() =>
      putLuckyBoxConfigBodySchema.parse({
        enabled: true,
        prizes: [
          { ...validPrize, enabled: false },
          { ...validPrize, enabled: false },
        ],
      }),
    );
    // А выключенная игра может хранить все призы выключенными.
    assert.doesNotThrow(() =>
      putLuckyBoxConfigBodySchema.parse({
        enabled: false,
        prizes: [{ ...validPrize, enabled: false }],
      }),
    );
  });

  it("границы скидки 1..90 включительно", () => {
    assert.doesNotThrow(() =>
      putLuckyBoxConfigBodySchema.parse({
        enabled: true,
        prizes: [
          { discountPercent: LUCKY_BOX_DISCOUNT_PERCENT_MIN, durationHours: 1 },
          { discountPercent: LUCKY_BOX_DISCOUNT_PERCENT_MAX, durationHours: 24 },
        ],
      }),
    );
    assert.throws(() =>
      putLuckyBoxConfigBodySchema.parse({
        enabled: true,
        prizes: [{ discountPercent: 0, durationHours: 1 }],
      }),
    );
    assert.throws(() =>
      putLuckyBoxConfigBodySchema.parse({
        enabled: true,
        prizes: [{ discountPercent: 91, durationHours: 1 }],
      }),
    );
  });

  it("границы срока 1..24 часа включительно", () => {
    assert.throws(() =>
      putLuckyBoxConfigBodySchema.parse({
        enabled: true,
        prizes: [{ discountPercent: 10, durationHours: 0 }],
      }),
    );
    assert.throws(() =>
      putLuckyBoxConfigBodySchema.parse({
        enabled: true,
        prizes: [
          { discountPercent: 10, durationHours: LUCKY_BOX_DURATION_HOURS_MAX + 1 },
        ],
      }),
    );
    assert.doesNotThrow(() =>
      putLuckyBoxConfigBodySchema.parse({
        enabled: false,
        prizes: [
          { discountPercent: 5, durationHours: LUCKY_BOX_DURATION_HOURS_MIN },
          { discountPercent: 5, durationHours: LUCKY_BOX_DURATION_HOURS_MAX },
        ],
      }),
    );
  });

  it("требует enabled", () => {
    assert.throws(() =>
      putLuckyBoxConfigBodySchema.parse({ prizes: [validPrize, validPrize] }),
    );
  });
});

describe("playLuckyBoxBodySchema", () => {
  it("принимает индексы 0..5", () => {
    for (let index = 0; index < LUCKY_BOX_BOXES_TOTAL; index += 1) {
      assert.equal(playLuckyBoxBodySchema.parse({ boxIndex: index }).boxIndex, index);
    }
  });

  it("отклоняет индекс вне диапазона и дробные", () => {
    assert.throws(() => playLuckyBoxBodySchema.parse({ boxIndex: -1 }));
    assert.throws(() =>
      playLuckyBoxBodySchema.parse({ boxIndex: LUCKY_BOX_BOXES_TOTAL }),
    );
    assert.throws(() => playLuckyBoxBodySchema.parse({ boxIndex: 1.5 }));
  });
});

describe("prizeProductId в призе", () => {
  it("по умолчанию null, принимает ObjectId и отклоняет мусор", () => {
    const parsedDefault = putLuckyBoxConfigBodySchema.parse({
      enabled: true,
      prizes: [validPrize],
    });
    assert.equal(parsedDefault.prizes[0].prizeProductId, null);

    const parsedWith = putLuckyBoxConfigBodySchema.parse({
      enabled: true,
      prizes: [{ ...validPrize, prizeProductId: "6af0c4bcb5658b01e9a19c8a" }],
    });
    assert.equal(parsedWith.prizes[0].prizeProductId, "6af0c4bcb5658b01e9a19c8a");

    assert.throws(() =>
      putLuckyBoxConfigBodySchema.parse({
        enabled: true,
        prizes: [{ ...validPrize, prizeProductId: "nope" }],
      }),
    );
  });
});
