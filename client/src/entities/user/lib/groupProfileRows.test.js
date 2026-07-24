import { describe, expect, it } from "vitest";

import { groupProfileRows } from "./groupProfileRows.js";

describe("groupProfileRows", () => {
  it("называет stats-секцию «Основное» (паритет с mobile)", () => {
    const sections = groupProfileRows([
      { id: "followersCount", label: "Подписчики", value: "3" },
      { id: "userName", label: "Имя", value: "tester" },
    ]);

    expect(sections.find((section) => section.id === "stats")?.title).toBe(
      "Основное",
    );
  });
});
