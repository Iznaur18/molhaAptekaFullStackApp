import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { MY_PROFILE_MOBILE_NAV_EXIT_MS } from "../lib/myProfileMobileNavConstants.js";
import { useMyProfilePageUi } from "./useMyProfilePageUi.js";

vi.mock("../../../shared/lib/useMaxWidthMediaQuery.js", () => ({
  useMaxWidthMediaQuery: () => true,
}));

vi.mock("../../../shared/lib/useScrollLock.js", () => ({
  useScrollLock: vi.fn(),
}));

describe("useMyProfilePageUi mobile nav", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"] });
    vi.mocked(useScrollLock).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mounts closed, then becomes visible after paint; unmounts after close exit", () => {
    const { result } = renderHook(() =>
      useMyProfilePageUi({
        user: { _id: "u1", userRole: "user" },
        isProfileReady: true,
        activeTab: "overview",
        canUseEditProfile: true,
        isRegularUser: true,
      }),
    );

    expect(result.current.isMobileNavMounted).toBe(false);
    expect(result.current.isMobileNavVisible).toBe(false);
    expect(useScrollLock).toHaveBeenCalledWith(false, { strategy: "overflow" });

    act(() => {
      result.current.openMobileNav();
    });

    expect(result.current.isMobileNavOpen).toBe(true);
    expect(result.current.isMobileNavMounted).toBe(true);
    expect(result.current.isMobileNavVisible).toBe(false);
    expect(useScrollLock).toHaveBeenCalledWith(true, { strategy: "overflow" });

    act(() => {
      vi.runOnlyPendingTimers();
    });
    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(result.current.isMobileNavVisible).toBe(true);

    act(() => {
      result.current.closeMobileNav();
    });

    expect(result.current.isMobileNavOpen).toBe(false);
    expect(result.current.isMobileNavVisible).toBe(false);
    expect(result.current.isMobileNavMounted).toBe(true);

    act(() => {
      vi.advanceTimersByTime(MY_PROFILE_MOBILE_NAV_EXIT_MS);
    });

    expect(result.current.isMobileNavMounted).toBe(false);
  });
});
