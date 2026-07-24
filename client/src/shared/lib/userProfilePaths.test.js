import { describe, expect, it } from "vitest";

import {
  buildUserProfilePath,
  isHtmlDocumentAccept,
  isUserProfileSpaPath,
  parseUserIdFromProfilePathname,
  shouldServeUserProfileAsSpa,
} from "./userProfilePaths.js";

const USER_ID = "6a5bf6539cfea35f316dd4fc";

describe("userProfilePaths", () => {
  it("parses SPA /user/:mongoId", () => {
    expect(parseUserIdFromProfilePathname(`/user/${USER_ID}`)).toBe(USER_ID);
    expect(isUserProfileSpaPath(`/user/${USER_ID}`)).toBe(true);
    expect(isUserProfileSpaPath(`/user/${USER_ID}/products`)).toBe(false);
    expect(isUserProfileSpaPath("/user-list")).toBe(false);
    expect(isUserProfileSpaPath("/user/me")).toBe(false);
  });

  it("buildUserProfilePath", () => {
    expect(buildUserProfilePath(USER_ID)).toBe(`/user/${USER_ID}`);
    expect(buildUserProfilePath("")).toBe(null);
  });

  it("Accept: HTML document → SPA, JSON → API", () => {
    expect(isHtmlDocumentAccept("text/html,application/xhtml+xml")).toBe(true);
    expect(
      isHtmlDocumentAccept("application/json, text/plain, */*"),
    ).toBe(false);
    expect(
      shouldServeUserProfileAsSpa(
        `/user/${USER_ID}`,
        "text/html,application/xhtml+xml",
      ),
    ).toBe(true);
    expect(
      shouldServeUserProfileAsSpa(
        `/user/${USER_ID}`,
        "application/json, text/plain, */*",
      ),
    ).toBe(false);
  });
});
