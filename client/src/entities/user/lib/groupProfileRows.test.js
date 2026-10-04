import { describe, expect, it } from "vitest";

import { groupProfileRows } from "./groupProfileRows.js";

describe("groupProfileRows", () => {
  it("называет stats-секцию «Основное» (паритет с mobile)", () => {
    const sections = groupProfileRows([
      { id: "followersCount", label: "Подписчики", value: "3" },
      { id: "userName", label: "Имя", value: "tester" },
    ]);

    expect(sections.find((section) => section.id === "stats")?.title).toBe("Основное");
  });

  it("stats: пары напротив друг друга, без счётчика продаж, баллы внизу", () => {
    const sections = groupProfileRows([
      { id: "followersCount", label: "Подписчики", value: "6" },
      { id: "followingCount", label: "Подписки", value: "7" },
      { id: "totalSalesCount", label: "Продажи", value: "52" },
      { id: "totalSalesAmount", label: "Продаж на сумму", value: "3.2M" },
      { id: "totalPurchasesAmount", label: "Покупок на сумму", value: "10K" },
      { id: "userLoyaltyPoints", label: "Баллы лояльности", value: "40" },
      { id: "userRatingByVotes", label: "Оценка", value: "4.8" },
      { id: "wishlistCount", label: "Желания", value: "3" },
    ]);
    const ids = sections
      .find((section) => section.id === "stats")
      ?.rows.map((row) => row.id);

    expect(ids).toEqual([
      "followingCount",
      "followersCount",
      "totalSalesAmount",
      "totalPurchasesAmount",
      "wishlistCount",
      "userRatingByVotes",
      "userLoyaltyPoints",
    ]);
  });
});
