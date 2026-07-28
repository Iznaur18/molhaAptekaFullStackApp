import { afterEach, describe, expect, it } from "vitest";

import {
  VIEWER_REGION_SESSION_STORAGE_KEY,
  readSessionViewerRegionCode,
  resolveClientViewerRegionCode,
  writeSessionViewerRegionCode,
} from "./viewerRegion.js";

afterEach(() => {
  sessionStorage.removeItem(VIEWER_REGION_SESSION_STORAGE_KEY);
});

describe("viewerRegion", () => {
  it("writes and reads valid session region", () => {
    writeSessionViewerRegionCode("RU-CE");
    expect(readSessionViewerRegionCode()).toBe("RU-CE");
  });

  it("ignores invalid session code", () => {
    sessionStorage.setItem(VIEWER_REGION_SESSION_STORAGE_KEY, "not-a-region");
    expect(readSessionViewerRegionCode()).toBeNull();
  });

  it("resolve: session beats profile", () => {
    writeSessionViewerRegionCode("RU-TA");
    expect(resolveClientViewerRegionCode("RU-MOW")).toBe("RU-TA");
  });

  it("resolve: profile when no session", () => {
    expect(resolveClientViewerRegionCode("RU-CE")).toBe("RU-CE");
  });

  it("resolve: default Moscow when empty", () => {
    expect(resolveClientViewerRegionCode(null)).toBe("RU-MOW");
    expect(resolveClientViewerRegionCode("")).toBe("RU-MOW");
  });
});
