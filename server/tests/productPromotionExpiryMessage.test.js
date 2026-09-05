import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";

const {
  buildProductPromotionAlreadyActiveMessage,
  formatProductPromotionExpiryLabel,
} = await import("../services/product/productPromotionHelpers.js");

describe("дата окончания продвижения в отказе", () => {
  it("называет дату и время, до которых ждать", () => {
    const message = buildProductPromotionAlreadyActiveMessage({
      catalogPromotionExpiresAt: "2026-09-27T08:47:29.073Z",
    });

    assert.match(message, /27 сентября/);
    assert.match(message, /уже есть активное продвижение/);
  });

  it("считает дату по московскому времени, а не по UTC", () => {
    // 21:30 UTC — это уже следующий день в Москве. Продавец должен увидеть
    // ту дату, в которой он живёт.
    const label = formatProductPromotionExpiryLabel("2026-09-26T21:30:00.000Z");

    assert.match(label, /27 сентября/, `получили «${label}»`);
  });

  it("без даты остаётся простой отказ, а не «до null»", () => {
    assert.equal(
      buildProductPromotionAlreadyActiveMessage({}),
      "У товара уже есть активное продвижение",
    );
    assert.equal(
      buildProductPromotionAlreadyActiveMessage(null),
      "У товара уже есть активное продвижение",
    );
  });

  it("битая дата не ломает сообщение", () => {
    assert.equal(formatProductPromotionExpiryLabel("не дата"), null);
    assert.equal(
      buildProductPromotionAlreadyActiveMessage({
        catalogPromotionExpiresAt: "не дата",
      }),
      "У товара уже есть активное продвижение",
    );
  });
});
