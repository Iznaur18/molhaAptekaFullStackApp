import { test as base, expect } from "@playwright/test";

const APP_INTRO_SEEN_STORAGE_KEY = "izibuy_app_intro_seen_v1";

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript((storageKey) => {
      localStorage.setItem(storageKey, "1");
    }, APP_INTRO_SEEN_STORAGE_KEY);
    await use(context);
  },
});

export { expect };
