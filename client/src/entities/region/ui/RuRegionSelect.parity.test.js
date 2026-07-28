import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = dirname(fileURLToPath(import.meta.url));

describe("RuRegionSelect searchable sheet", () => {
  it("opens form trigger into ViewerRegionPickerSheet", () => {
    const select = readFileSync(join(dir, "RuRegionSelect.jsx"), "utf8");
    expect(select).toMatch(/ViewerRegionPickerSheet/);
    expect(select).toMatch(/ru-region-select__trigger/);
    expect(select).not.toMatch(/<select[\s>]/);
  });
});
