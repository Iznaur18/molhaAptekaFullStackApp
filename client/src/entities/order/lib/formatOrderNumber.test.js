import { describe, expect, it } from "vitest";

import { formatOrderNumber } from "./formatOrderNumber.js";

describe("formatOrderNumber", () => {
  it("берёт последние 8 символов id", () => {
    expect(formatOrderNumber("6a9addf2378b027b3d6038a7")).toBe("3D6038A7");
  });

  it("пустой id — пустая строка", () => {
    expect(formatOrderNumber("")).toBe("");
    expect(formatOrderNumber(null)).toBe("");
  });
});
