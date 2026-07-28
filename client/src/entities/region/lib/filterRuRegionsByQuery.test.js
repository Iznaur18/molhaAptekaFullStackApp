import { describe, expect, it } from "vitest";

import { filterRuRegionsByQuery } from "./filterRuRegionsByQuery.js";

describe("filterRuRegionsByQuery", () => {
  it("returns all when query empty", () => {
    const all = filterRuRegionsByQuery("");
    expect(all.length).toBeGreaterThan(80);
  });

  it("matches name and alias", () => {
    const byName = filterRuRegionsByQuery("москва");
    expect(byName.some((r) => r.code === "RU-MOW")).toBe(true);

    const byAlias = filterRuRegionsByQuery("чечня");
    expect(byAlias.some((r) => r.code === "RU-CE")).toBe(true);
  });

  it("returns empty for unknown", () => {
    expect(filterRuRegionsByQuery("zzzz-not-a-region")).toEqual([]);
  });

  it("pins selected region to the top", () => {
    const pinned = filterRuRegionsByQuery("", undefined, "RU-MOW");
    expect(pinned[0]?.code).toBe("RU-MOW");
    expect(pinned.filter((r) => r.code === "RU-MOW")).toHaveLength(1);
  });

  it("keeps selected on top when it matches query", () => {
    const pinned = filterRuRegionsByQuery("республика", undefined, "RU-DA");
    expect(pinned[0]?.code).toBe("RU-DA");
  });
});
