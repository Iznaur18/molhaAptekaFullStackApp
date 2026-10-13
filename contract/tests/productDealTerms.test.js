import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatProductDealPrice,
  isProductServicePriceFixed,
  normalizeProductServiceLocations,
  resolveProductViewingSchedule,
} from "../src/productDealTerms.js";
import {
  createProductBodySchema,
  patchMyProductBodySchema,
} from "../src/productWrite.js";

describe("productDealTerms contract", () => {
  it("цена услуги: точная, «от» с единицей и договорная", () => {
    const service = (extra) => ({ productDealType: "service", ...extra });

    assert.equal(formatProductDealPrice(service({}), "1 500 ₽"), "1 500 ₽");
    assert.equal(
      formatProductDealPrice(
        service({ productServicePriceMode: "from", productServicePriceUnit: "hour" }),
        "1 500 ₽",
      ),
      "от 1 500 ₽ / час",
    );
    assert.equal(
      formatProductDealPrice(service({ productServicePriceUnit: "sqm" }), "900 ₽"),
      "900 ₽ / м²",
    );
    assert.equal(
      formatProductDealPrice(service({ productServicePriceMode: "negotiable" }), "1 ₽"),
      "Договорная",
    );
  });

  it("у товара и осмотра цена не меняется, даже если поля услуги заполнены", () => {
    const leftover = { productServicePriceMode: "negotiable" };
    assert.equal(formatProductDealPrice({ ...leftover }, "500 ₽"), "500 ₽");
    assert.equal(
      formatProductDealPrice({ productDealType: "viewing", ...leftover }, "500 ₽"),
      "500 ₽",
    );
    assert.equal(formatProductDealPrice(null, "500 ₽"), "500 ₽");
  });

  it("точной цена считается только в режиме «точная»", () => {
    assert.equal(isProductServicePriceFixed({}), true);
    assert.equal(
      isProductServicePriceFixed({ productServicePriceMode: "from" }),
      false,
    );
    assert.equal(
      isProductServicePriceFixed({ productServicePriceMode: "negotiable" }),
      false,
    );
  });

  it("места оказания: без мусора, без повторов, в порядке справочника", () => {
    assert.deepEqual(
      normalizeProductServiceLocations(["online", "at_client", "online", "moon"]),
      ["at_client", "online"],
    );
    assert.deepEqual(normalizeProductServiceLocations(undefined), []);
  });

  it("расписание осмотра показывается только у осмотра", () => {
    const schedule = " Будни после 18:00 ";
    assert.equal(
      resolveProductViewingSchedule({
        productDealType: "viewing",
        productViewingSchedule: schedule,
      }),
      "Будни после 18:00",
    );
    assert.equal(
      resolveProductViewingSchedule({
        productDealType: "service",
        productViewingSchedule: schedule,
      }),
      "",
    );
  });

  it("схема правки товара не срезает условия сделки", () => {
    const parsed = patchMyProductBodySchema.parse({
      productServicePriceMode: "from",
      productServicePriceUnit: "hour",
      productServiceLocations: ["at_client", "at_client"],
      productViewingSchedule: " по выходным ",
    });

    assert.equal(parsed.productServicePriceMode, "from");
    assert.equal(parsed.productServicePriceUnit, "hour");
    assert.deepEqual(parsed.productServiceLocations, ["at_client"]);
    assert.equal(parsed.productViewingSchedule, "по выходным");
    assert.equal(
      patchMyProductBodySchema.safeParse({ productServicePriceMode: "free" }).success,
      false,
    );
  });

  it("схема создания товара знает те же поля", () => {
    const shape = createProductBodySchema.shape ?? createProductBodySchema._def;
    assert.ok(shape, "схема создания доступна");
    const result = createProductBodySchema.safeParse({
      productServicePriceMode: "free",
    });
    assert.equal(result.success, false);
    assert.ok(
      result.error.issues.some((issue) => issue.path[0] === "productServicePriceMode"),
      "неверный вид цены отклоняется именно по своему полю",
    );
  });
});
