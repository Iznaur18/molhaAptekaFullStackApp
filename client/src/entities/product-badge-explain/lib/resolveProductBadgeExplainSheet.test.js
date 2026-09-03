import { describe, expect, it } from "vitest";

import {
  resolveProductBadgeExplainFallbackDescription,
  resolveProductDetailsBadgeExplainRequest,
} from "./resolveProductBadgeExplainSheet.js";

describe("resolveProductDetailsBadgeExplainRequest", () => {
  it("maps auction / installment / wholesale / rental / nearDistance", () => {
    expect(resolveProductDetailsBadgeExplainRequest({ kind: "auction", label: "Аукцион" })).toEqual({
      title: "Аукцион",
      badgeKey: "auction",
      fallbackKey: "auction",
    });
    expect(
      resolveProductDetailsBadgeExplainRequest({ kind: "installment", label: "Рассрочка" }),
    ).toEqual({
      title: "Рассрочка",
      badgeKey: "installment",
      fallbackKey: "installment",
    });
    expect(
      resolveProductDetailsBadgeExplainRequest({ kind: "wholesale", label: "Оптовая цена" }),
    ).toEqual({
      title: "Оптовая цена",
      badgeKey: "wholesale",
      fallbackKey: "wholesale",
    });
    expect(
      resolveProductDetailsBadgeExplainRequest({ kind: "rental", label: "Аренда" }),
    ).toEqual({
      title: "Аренда",
      badgeKey: "rental",
      fallbackKey: "rental",
    });
    expect(
      resolveProductDetailsBadgeExplainRequest({ kind: "nearDistance", label: "~1.2 км" }),
    ).toEqual({
      title: "~1.2 км",
      badgeKey: "near_distance",
      fallbackKey: "near_distance",
    });
  });
});

describe("значок безопасной сделки", () => {
  it("ведёт на карточку safe_deal", () => {
    expect(
      resolveProductDetailsBadgeExplainRequest({
        kind: "safeDeal",
        label: "Продавец проверен",
      }),
    ).toEqual({
      title: "Продавец проверен",
      badgeKey: "safe_deal",
      fallbackKey: "safe_deal",
    });
  });

  it("описание берётся не из общей таблицы, а из текущего состояния площадки", () => {
    const description = resolveProductBadgeExplainFallbackDescription("safe_deal");

    expect(description).toContain("продавц");
    expect(description).not.toBe(
      resolveProductBadgeExplainFallbackDescription("listing_origin_unspecified"),
    );
  });
});
