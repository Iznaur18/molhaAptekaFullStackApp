import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const {
  AUCTION_DEAL_TYPE_FORBIDDEN_MESSAGE,
  assertAuctionAcceptsBids,
  computeAuctionActive,
} = await import("../services/product/productAuction.js");

const auctionProduct = {
  productAuctionEnabled: true,
  productModerationStatus: "approved",
  productIsAvailable: true,
};

describe("аукцион и тип сделки", () => {
  it("у обычного товара и товара без поля аукцион работает", () => {
    assert.equal(computeAuctionActive(auctionProduct), true);
    assert.equal(
      computeAuctionActive({ ...auctionProduct, productDealType: "goods" }),
      true,
    );
    assert.doesNotThrow(() => assertAuctionAcceptsBids(auctionProduct));
  });

  it("у осмотра и услуги аукциона нет, даже если флаг включён", () => {
    for (const productDealType of ["viewing", "service"]) {
      const product = { ...auctionProduct, productDealType };

      // Принятая ставка ведёт к заказу, а заказ у них запрещён.
      assert.equal(computeAuctionActive(product), false, productDealType);
      assert.throws(() => assertAuctionAcceptsBids(product), {
        message: AUCTION_DEAL_TYPE_FORBIDDEN_MESSAGE,
      });
    }
  });
});
