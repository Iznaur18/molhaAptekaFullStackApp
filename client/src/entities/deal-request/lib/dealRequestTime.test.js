import { describe, expect, it } from "vitest";

import {
  defaultDealRequestTime,
  formatDealRequestTime,
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from "./dealRequestTime.js";

describe("dealRequestTime", () => {
  it("значение поля и ISO переводятся туда и обратно без сдвига пояса", () => {
    const local = "2026-10-14T18:30";
    const iso = fromDateTimeLocalValue(local);

    expect(iso).toBe(new Date(2026, 9, 14, 18, 30).toISOString());
    expect(toDateTimeLocalValue(iso)).toBe(local);
  });

  it("пустое и битое значение дают null и пустую строку", () => {
    expect(fromDateTimeLocalValue("")).toBeNull();
    expect(fromDateTimeLocalValue("не дата")).toBeNull();
    expect(toDateTimeLocalValue(null)).toBe("");
    expect(formatDealRequestTime("не дата")).toBe("");
  });

  it("время по умолчанию — завтра в полдень", () => {
    const next = defaultDealRequestTime(new Date(2026, 9, 13, 23, 50));

    expect(toDateTimeLocalValue(next)).toBe("2026-10-14T12:00");
  });

  it("дата показывается по-русски с временем", () => {
    const text = formatDealRequestTime(new Date(2026, 9, 14, 18, 30).toISOString());

    expect(text).toContain("14 октября");
    expect(text).toContain("18:30");
  });
});
