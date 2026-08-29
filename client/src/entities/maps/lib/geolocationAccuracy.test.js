import { describe, expect, it } from "vitest";

import { ADDRESS_DELIVERY_UI } from "../../../shared/config/appUiCopy.js";
import {
  formatGeolocationLowAccuracyMessage,
  GEOLOCATION_LOW_ACCURACY_THRESHOLD_M,
  isGeolocationAccuracyLow,
} from "./geolocationAccuracy.js";

describe("geolocationAccuracy", () => {
  it("treats coarse readings as low accuracy", () => {
    expect(isGeolocationAccuracyLow(GEOLOCATION_LOW_ACCURACY_THRESHOLD_M + 1)).toBe(true);
    expect(isGeolocationAccuracyLow(25_000)).toBe(true);
    expect(isGeolocationAccuracyLow(Number.NaN)).toBe(true);
  });

  it("accepts precise readings", () => {
    expect(isGeolocationAccuracyLow(GEOLOCATION_LOW_ACCURACY_THRESHOLD_M)).toBe(false);
    expect(isGeolocationAccuracyLow(120)).toBe(false);
  });

  it("formats low-accuracy message", () => {
    expect(
      formatGeolocationLowAccuracyMessage(
        12_000,
        ADDRESS_DELIVERY_UI.MAP_MY_LOCATION_LOW_ACCURACY,
      ),
    ).toContain("12 км");
  });
});
