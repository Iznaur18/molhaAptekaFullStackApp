import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatBusinessHoursWeekdayRangesCompact,
  formatUserBusinessHoursCompactRange,
  isSellerScheduleClosedNow,
  resolveSellerScheduleOpensAtTime,
} from "../src/userBusinessHours.js";

describe("userBusinessHours", () => {
  it("returns false when schedule disabled", () => {
    assert.equal(
      isSellerScheduleClosedNow(
        { enabled: false, weekdays: [0], openTime: "09:00", closeTime: "18:00" },
        "RU-MOW",
        new Date("2026-08-29T10:00:00.000Z"),
      ),
      false,
    );
  });

  it("returns true outside working hours on working day", () => {
    assert.equal(
      isSellerScheduleClosedNow(
        { enabled: true, weekdays: [0, 1, 2, 3, 4], openTime: "09:00", closeTime: "18:00" },
        "RU-MOW",
        new Date("2026-08-31T05:00:00.000Z"),
      ),
      true,
    );
  });

  it("returns false inside working hours", () => {
    assert.equal(
      isSellerScheduleClosedNow(
        { enabled: true, weekdays: [0, 1, 2, 3, 4], openTime: "09:00", closeTime: "18:00" },
        "RU-MOW",
        new Date("2026-08-31T08:00:00.000Z"),
      ),
      false,
    );
  });

  it("resolves opens-at time before opening on working day", () => {
    assert.equal(
      resolveSellerScheduleOpensAtTime(
        { enabled: true, weekdays: [0, 1, 2, 3, 4], openTime: "09:00", closeTime: "18:00" },
        "RU-MOW",
        new Date("2026-08-31T05:00:00.000Z"),
      ),
      "09:00",
    );
  });

  it("resolves opens-at time after close on working day", () => {
    assert.equal(
      resolveSellerScheduleOpensAtTime(
        { enabled: true, weekdays: [0, 1, 2, 3, 4], openTime: "09:00", closeTime: "18:00" },
        "RU-MOW",
        new Date("2026-08-31T16:00:00.000Z"),
      ),
      "09:00",
    );
  });

  it("formats weekday ranges as ПН-СБ", () => {
    assert.equal(formatBusinessHoursWeekdayRangesCompact([0, 1, 2, 3, 4, 5]), "ПН-СБ");
    assert.equal(formatBusinessHoursWeekdayRangesCompact([0, 1, 2, 3, 4]), "ПН-ПТ");
    assert.equal(formatBusinessHoursWeekdayRangesCompact([0]), "ПН");
    assert.equal(
      formatBusinessHoursWeekdayRangesCompact([0, 1, 2, 4, 5]),
      "ПН-СР, ПТ-СБ",
    );
  });

  it("formats compact schedule with time", () => {
    assert.equal(
      formatUserBusinessHoursCompactRange({
        userBusinessHoursEnabled: true,
        userBusinessHours: {
          weekdays: [0, 1, 2, 3, 4, 5],
          openTime: "10:00",
          closeTime: "18:00",
        },
      }),
      "ПН-СБ, 10:00–18:00",
    );
  });
});
