import { describe, expect, it } from "vitest";

const { fetchCatalogProductsByIds } = await import("./fetchCatalogProductsByIds.js");

describe("fetchCatalogProductsByIds", () => {
  it("без id не ходит в сеть и возвращает []", async () => {
    await expect(fetchCatalogProductsByIds([])).resolves.toEqual([]);
    await expect(fetchCatalogProductsByIds(null)).resolves.toEqual([]);
  });
});
