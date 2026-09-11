import { expect, test } from "./helpers/test.js";

import {
  claimPromoReturnStreak,
  loginAndGetCookieHeader,
  replaceCartItems,
} from "./helpers/api.js";
import { loginViaHeaderModal } from "./helpers/auth.js";
import { E2E_BUYER, E2E_FIXTURE } from "./helpers/fixtures.js";

test("вход → каталог → корзина", async ({ page, request }) => {
  const cookie = await loginAndGetCookieHeader(request, E2E_BUYER);
  await replaceCartItems(request, cookie, {});
  // Иначе плашка «Скидка за возвращение» перехватывает клик по карточке.
  await claimPromoReturnStreak(request, cookie);

  await loginViaHeaderModal(page, E2E_BUYER);

  await page.goto("/");
  // Сид создаёт ещё 105 товаров «E2E Virtual Catalog», и в ленте «сначала новые»
  // нужная карточка не попадает в первые отрисованные — ищем её по названию.
  // Поиск уходит на сервер только по Enter, ввод сам по себе ленту не фильтрует.
  const searchBox = page.getByRole("searchbox", { name: "Поиск товаров" });
  await searchBox.fill(E2E_FIXTURE.catalogProductName);
  await searchBox.press("Enter");
  const productHeading = page.getByRole("heading", {
    name: E2E_FIXTURE.catalogProductName,
    exact: true,
  });
  await expect(productHeading).toBeVisible({ timeout: 20_000 });
  await productHeading.scrollIntoViewIfNeeded();
  await productHeading.click();

  // Детали товара — отдельная страница /product/:id, а не модалка.
  await page.waitForURL((url) => url.pathname.startsWith("/product/"), {
    timeout: 15_000,
  });
  const addButton = page
    .getByRole("button", { name: "В корзину", exact: true })
    .first();
  await expect(addButton).toBeVisible({ timeout: 15_000 });
  await addButton.click();
  // На странице товара вместо счётчика появляется «Перейти в корзину» —
  // это и есть подтверждение, что товар лёг в корзину.
  const goToCartButton = page
    .getByRole("button", { name: "Перейти в корзину", exact: true })
    .first();
  await expect(goToCartButton).toBeVisible();
  await goToCartButton.click();
  await expect(page).toHaveURL(/\/basket/);
  // Корзина сначала показывает продавцов; товары — внутри корзины продавца.
  await page.locator(".cart-seller-row__checkout").first().click();
  await expect(page.getByText(E2E_FIXTURE.catalogProductName).first()).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("Итого")).toBeVisible();
});
