import { describe, expect, it } from "vitest";

import * as profileTabs from "./profileTabs.js";
import { profileTabToMainView } from "./profileTabToMainView.js";

const declaredTabs = Object.entries(profileTabs)
  .filter(([name, value]) => name.startsWith("PROFILE_TAB_") && typeof value === "string")
  .map(([name, value]) => ({ name, value }));

/**
 * Вкладки, которым «мой профиль» — правильный ответ.
 *
 * PRODUCT_PROMOTIONS в оболочке своего раздела не имеет и в меню не выводится:
 * страница живёт на собственном маршруте /product-promotions. Вкладка
 * осталась от прежней навигации.
 */
const KNOWN_PROFILE_TABS = new Set([
  profileTabs.PROFILE_TAB_OVERVIEW,
  profileTabs.PROFILE_TAB_PRODUCT_PROMOTIONS,
]);

describe("вкладки профиля ведут каждая в свой раздел", () => {
  it("ни одна не сваливается обратно в профиль", () => {
    // Забытая вкладка не даёт ошибки — она молча возвращает в «мой профиль».
    // Так пропали «Службы доставки» и «Споры по отправлениям».
    const fallsBackToProfile = declaredTabs
      .filter(({ value }) => !KNOWN_PROFILE_TABS.has(value))
      .filter(({ value }) => profileTabToMainView(value) === "my-profile")
      .map(({ name }) => name);

    expect(fallsBackToProfile).toEqual([]);
  });

  it("админские службы доставки открываются", () => {
    expect(profileTabToMainView(profileTabs.PROFILE_TAB_SHIPPING_CARRIERS)).toBe(
      "shipping-carriers",
    );
  });

  it("споры по отправлениям открываются", () => {
    expect(profileTabToMainView(profileTabs.PROFILE_TAB_SHIPMENT_DISPUTES)).toBe(
      "shipment-disputes",
    );
  });
});
