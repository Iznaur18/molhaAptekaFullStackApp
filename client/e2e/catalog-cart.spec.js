import { expect, test } from "@playwright/test";

import { loginAndGetCookieHeader, replaceCartItems } from "./helpers/api.js";
import { loginViaHeaderModal } from "./helpers/auth.js";
import { E2E_BUYER, E2E_FIXTURE } from "./helpers/fixtures.js";

test("вход → каталог → корзина", async ({ page, request }) => {
  const cookie = await loginAndGetCookieHeader(request, E2E_BUYER);
  await replaceCartItems(request, cookie, {});

  await loginViaHeaderModal(page, E2E_BUYER);

  await page.goto("/");
  const productHeading = page.getByRole("heading", {
    name: E2E_FIXTURE.catalogProductName,
    exact: true,
  });
  await expect(productHeading).toBeVisible({ timeout: 20_000 });
  await productHeading.scrollIntoViewIfNeeded();
  await productHeading.click();

  const detailsModal = page.getByRole("dialog").filter({ has: productHeading });
  await expect(detailsModal).toBeVisible();
  const addButton = detailsModal.getByRole("button", { name: "В корзину" });
  await expect(addButton).toBeVisible({ timeout: 15_000 });
  await addButton.click();
  await expect(detailsModal.getByLabel("Количество в корзине")).toHaveText("1");

  await detailsModal.getByLabel("Закрыть").click();
  await expect(detailsModal).toBeHidden();

  await page.getByRole("button", { name: "Открыть корзину" }).click();
  await expect(page).toHaveURL(/\/basket/);
  await expect(page.getByText(E2E_FIXTURE.catalogProductName)).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("Итого")).toBeVisible();
});
