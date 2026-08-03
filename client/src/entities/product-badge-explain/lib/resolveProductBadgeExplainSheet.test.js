import { describe, expect, it } from "vitest";

import { resolveProductDetailsBadgeExplainRequest } from "./resolveProductBadgeExplainSheet.js";

describe("resolveProductDetailsBadgeExplainRequest", () => {
  it("maps auction / installment / wholesale / nearDistance", () => {
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
      resolveProductDetailsBadgeExplainRequest({ kind: "nearDistance", label: "~1.2 км" }),
    ).toEqual({
      title: "~1.2 км",
      badgeKey: "near_distance",
      fallbackKey: "near_distance",
    });
  });
});
