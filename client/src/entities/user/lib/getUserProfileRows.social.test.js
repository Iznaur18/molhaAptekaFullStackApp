import { describe, expect, it } from "vitest";

import { getUserProfileRows } from "./getUserProfileRows.js";
import { groupProfileRows } from "./groupProfileRows.js";

describe("getUserProfileRows social", () => {
  it("добавляет только заполненные соцссылки с href", () => {
    const rows = getUserProfileRows({
      userName: "tester",
      socialTelegramUrl: "https://t.me/tester",
      socialInstagramUrl: "",
      socialVkUrl: null,
    });
    const telegram = rows.find((row) => row.id === "socialTelegramUrl");
    const instagram = rows.find((row) => row.id === "socialInstagramUrl");
    expect(telegram?.href).toBe("https://t.me/tester");
    expect(telegram?.value).toBe("t.me/tester");
    expect(instagram).toBeUndefined();
  });

  it("группирует соцссылки в секцию «Соцсети»", () => {
    const rows = getUserProfileRows({
      userName: "tester",
      socialWebsiteUrl: "https://example.com/me",
    });
    const sections = groupProfileRows(rows);
    const social = sections.find((section) => section.id === "social");
    expect(social?.title).toBe("Соцсети");
    expect(social?.rows).toHaveLength(1);
    expect(social?.rows[0]?.id).toBe("socialWebsiteUrl");
  });
});
