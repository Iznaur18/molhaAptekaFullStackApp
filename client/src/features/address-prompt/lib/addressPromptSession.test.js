import { afterEach, describe, expect, it } from "vitest";

import { ADDRESS_PROMPT_SESSION_STORAGE_KEY } from "../model/addressPromptConstants.js";
import {
  hasSeenAddressPromptThisSession,
  markAddressPromptSeenThisSession,
} from "./addressPromptSession.js";

describe("addressPromptSession", () => {
  afterEach(() => {
    sessionStorage.removeItem(ADDRESS_PROMPT_SESSION_STORAGE_KEY);
  });

  it("is per userId", () => {
    expect(hasSeenAddressPromptThisSession("a")).toBe(false);
    markAddressPromptSeenThisSession("a");
    expect(hasSeenAddressPromptThisSession("a")).toBe(true);
    expect(hasSeenAddressPromptThisSession("b")).toBe(false);
  });

  it("ignores empty userId", () => {
    markAddressPromptSeenThisSession("");
    expect(hasSeenAddressPromptThisSession("")).toBe(false);
  });
});
