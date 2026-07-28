import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = dirname(fileURLToPath(import.meta.url));

describe("ViewerRegionSelect sheet picker", () => {
  it("opens MapPin button into searchable sheet", () => {
    const select = readFileSync(join(dir, "ViewerRegionSelect.jsx"), "utf8");
    const sheet = readFileSync(join(dir, "ViewerRegionPickerSheet.jsx"), "utf8");
    expect(select).toMatch(/MapPin/);
    expect(select).toMatch(/ViewerRegionPickerSheet/);
    expect(select).not.toMatch(/RuRegionSelect/);
    expect(sheet).toMatch(/filterRuRegionsByQuery/);
    expect(sheet).toMatch(/SEARCH_PLACEHOLDER/);
    expect(sheet).toMatch(/createPortal/);
  });
});
