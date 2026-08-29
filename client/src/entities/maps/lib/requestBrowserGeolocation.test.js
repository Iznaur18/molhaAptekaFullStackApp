import { afterEach, describe, expect, it, vi } from "vitest";

import { ADDRESS_DELIVERY_UI } from "../../../shared/config/appUiCopy.js";
import { requestBrowserGeolocation } from "./requestBrowserGeolocation.js";

describe("requestBrowserGeolocation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("resolves coordinates with accuracy from navigator.geolocation", async () => {
    const getCurrentPosition = vi.fn((success) => {
      success({
        coords: { latitude: 55.751244, longitude: 37.618423, accuracy: 42 },
      });
    });
    const clearWatch = vi.fn();
    const watchPosition = vi.fn(() => 7);
    vi.stubGlobal("navigator", {
      geolocation: { getCurrentPosition, watchPosition, clearWatch },
    });
    vi.useFakeTimers();

    const promise = requestBrowserGeolocation();
    await vi.advanceTimersByTimeAsync(10_500);
    await expect(promise).resolves.toEqual({
      lat: 55.751244,
      lon: 37.618423,
      accuracyMeters: 42,
    });
  });

  it("resolves early when watch reaches target accuracy", async () => {
    const clearWatch = vi.fn();
    const watchPosition = vi.fn((success) => {
      success({
        coords: { latitude: 43.3178, longitude: 45.6985, accuracy: 35 },
      });
      return 3;
    });
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: vi.fn(),
        watchPosition,
        clearWatch,
      },
    });

    await expect(requestBrowserGeolocation()).resolves.toEqual({
      lat: 43.3178,
      lon: 45.6985,
      accuracyMeters: 35,
    });
    expect(clearWatch).toHaveBeenCalledWith(3);
  });

  it("rejects when geolocation is unavailable", async () => {
    vi.stubGlobal("navigator", {});

    await expect(requestBrowserGeolocation()).rejects.toThrow(
      ADDRESS_DELIVERY_UI.MAP_MY_LOCATION_UNAVAILABLE,
    );
  });

  it("rejects when permission denied", async () => {
    const getCurrentPosition = vi.fn((_success, error) => {
      error({ code: 1 });
    });
    const watchPosition = vi.fn(() => 1);
    const clearWatch = vi.fn();
    vi.stubGlobal("navigator", {
      geolocation: { getCurrentPosition, watchPosition, clearWatch },
    });
    vi.useFakeTimers();

    const promise = requestBrowserGeolocation();
    const assertion = expect(promise).rejects.toThrow(
      ADDRESS_DELIVERY_UI.MAP_MY_LOCATION_DENIED,
    );
    await vi.advanceTimersByTimeAsync(10_500);
    await assertion;
  });
});
