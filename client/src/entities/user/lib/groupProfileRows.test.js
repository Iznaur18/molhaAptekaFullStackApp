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

  it("ставит Подписчики и Продажи рядом в stats (2-col grid)", () => {
    const sections = groupProfileRows([
      { id: "followersCount", label: "Подписчики", value: "6" },
      { id: "followingCount", label: "Подписки", value: "7" },
      { id: "totalSalesCount", label: "Продажи", value: "52" },
    ]);
    const ids = sections
      .find((section) => section.id === "stats")
      ?.rows.map((row) => row.id);

    expect(ids?.slice(0, 2)).toEqual(["followersCount", "totalSalesCount"]);
  });
});
