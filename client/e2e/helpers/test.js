import { test as base, expect } from "@playwright/test";

// Ключи берём из приложения: при смене версии (cookie v1 → v2) тесты иначе
// ставили старый ключ, окно cookie оставалось открытым и перекрывало кнопки.
import { COOKIE_NOTICE_ACCEPTED_STORAGE_KEY } from "../../src/features/legal/model/cookieNoticeConstants.js";
import { APP_INTRO_SEEN_STORAGE_KEY } from "../../src/shared/config/appIntroConstants.js";

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
