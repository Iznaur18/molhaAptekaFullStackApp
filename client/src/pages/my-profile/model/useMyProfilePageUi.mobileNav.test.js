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
    vi.useFakeTimers();
    vi.mocked(useScrollLock).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("unmounts drawer overlay after close exit animation", () => {
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
    expect(useScrollLock).toHaveBeenCalledWith(false, { strategy: "overflow" });

    act(() => {
      result.current.openMobileNav();
    });

    // Открытие монтирует оверлей сразу — без промежуточного visible-кадра.
    expect(result.current.isMobileNavOpen).toBe(true);
    expect(result.current.isMobileNavMounted).toBe(true);
    expect(useScrollLock).toHaveBeenCalledWith(true, { strategy: "overflow" });

    act(() => {
      result.current.closeMobileNav();
    });

    // Оверлей остаётся в DOM до конца exit-анимации.
    expect(result.current.isMobileNavOpen).toBe(false);
    expect(result.current.isMobileNavMounted).toBe(true);

    act(() => {
      vi.advanceTimersByTime(MY_PROFILE_MOBILE_NAV_EXIT_MS);
    });

    expect(result.current.isMobileNavMounted).toBe(false);
  });
});
