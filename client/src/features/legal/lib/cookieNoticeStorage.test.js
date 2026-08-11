import { afterEach, describe, expect, it } from "vitest";

import { COOKIE_NOTICE_ACCEPTED_STORAGE_KEY } from "../model/cookieNoticeConstants.js";
import {
  hasAcceptedCookieNotice,
  markCookieNoticeAccepted,
} from "./cookieNoticeStorage.js";

describe("cookieNoticeStorage", () => {
  afterEach(() => {
    localStorage.removeItem(COOKIE_NOTICE_ACCEPTED_STORAGE_KEY);
  });

  it("returns false by default", () => {
    expect(hasAcceptedCookieNotice()).toBe(false);
  });

  it("persists acceptance", () => {
    markCookieNoticeAccepted();
    expect(localStorage.getItem(COOKIE_NOTICE_ACCEPTED_STORAGE_KEY)).toBe("1");
    expect(hasAcceptedCookieNotice()).toBe(true);
  });
});
