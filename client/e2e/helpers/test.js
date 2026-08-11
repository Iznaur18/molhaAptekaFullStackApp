import { test as base, expect } from "@playwright/test";

const APP_INTRO_SEEN_STORAGE_KEY = "izibuy_app_intro_seen_v1";
const COOKIE_NOTICE_ACCEPTED_STORAGE_KEY = "izibuy_cookie_notice_accepted_v1";

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(
      ([introKey, cookieKey]) => {
        localStorage.setItem(introKey, "1");
        localStorage.setItem(cookieKey, "1");
      },
      [APP_INTRO_SEEN_STORAGE_KEY, COOKIE_NOTICE_ACCEPTED_STORAGE_KEY],
    );
    await use(context);
  },
});

export { expect };
