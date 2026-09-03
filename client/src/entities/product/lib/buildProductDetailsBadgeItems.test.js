import { describe, expect, it } from "vitest";

import {
  buildProductDetailsBadgeItems,
  sortProductDetailsBadgesByLabelLength,
} from "./buildProductDetailsBadgeItems.js";

describe("sortProductDetailsBadgesByLabelLength", () => {
  it("orders shortest labels first", () => {
    const sorted = sortProductDetailsBadgesByLabelLength([
      { key: "long", label: "Очень длинный бейдж" },
      { key: "short", label: "Топ" },
      { key: "mid", label: "Аукцион" },
    ]);

    expect(sorted.map((item) => item.key)).toEqual(["short", "mid", "long"]);
  });
});

describe("buildProductDetailsBadgeItems", () => {
  it("adds auction / installment / wholesale / nearDistance when flags set", () => {
    const items = buildProductDetailsBadgeItems({
      product: {
        productAuctionEnabled: true,
        productInstallmentEnabled: true,
        productWholesaleEnabled: true,
        productWholesaleMinQty: 5,
        productWholesalePrice: 800,
        productPrice: 1000,
        distanceMeters: 1200,
        productListingOrigin: "own",
        productPriceMarketStatus: "unknown",
      },
    });

    const byKind = Object.fromEntries(items.map((item) => [item.kind, item]));
    expect(byKind.auction?.label).toBe("Аукцион");
    expect(byKind.installment?.label).toBe("Рассрочка");
    expect(byKind.wholesale?.label).toBe("Оптовая цена");
    expect(byKind.nearDistance?.label).toBe("~1.2 км");
  });

  it("skips auction when productAuctionEnabled is false even if lot active fields present", () => {
    const items = buildProductDetailsBadgeItems({
      product: {
        productAuctionEnabled: false,
        productListingOrigin: "own",
        productPriceMarketStatus: "unknown",
      },
    });

    expect(items.some((item) => item.kind === "auction")).toBe(false);
  });

  it("skips wholesale when not configured", () => {
    const items = buildProductDetailsBadgeItems({
      product: {
        productWholesaleEnabled: true,
        productWholesaleMinQty: 1,
        productWholesalePrice: 800,
        productPrice: 1000,
        productListingOrigin: "own",
        productPriceMarketStatus: "unknown",
      },
    });

    expect(items.some((item) => item.kind === "wholesale")).toBe(false);
  });
});

describe("buildProductDetailsBadgeItems — безопасная сделка", () => {
  it("показывает значок, когда у продавца заявка одобрена", () => {
    const items = buildProductDetailsBadgeItems({
      product: {
        productPrice: 1000,
        productPriceMarketStatus: "unknown",
        productSeller: { _id: "s1", sellerSafeDeal: { moderationStatus: "approved" } },
      },
    });

    expect(items.some((item) => item.kind === "safeDeal")).toBe(true);
  });

  it("не показывает значок, пока заявка на проверке", () => {
    const items = buildProductDetailsBadgeItems({
      product: {
        productPrice: 1000,
        productPriceMarketStatus: "unknown",
        productSeller: { _id: "s1", sellerSafeDeal: { moderationStatus: "pending" } },
      },
    });

    expect(items.some((item) => item.kind === "safeDeal")).toBe(false);
  });

  it("не падает, когда продавец приехал строкой-идентификатором", () => {
    const items = buildProductDetailsBadgeItems({
      product: {
        productPrice: 1000,
        productPriceMarketStatus: "unknown",
        productSeller: "68f0c0c0c0c0c0c0c0c0c0c0",
      },
    });

    expect(items.some((item) => item.kind === "safeDeal")).toBe(false);
  });
});
