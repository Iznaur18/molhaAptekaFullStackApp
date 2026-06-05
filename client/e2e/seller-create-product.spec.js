import { expect, test } from "@playwright/test";

import { loginViaHeaderModal } from "./helpers/auth.js";
import { E2E_SELLER } from "./helpers/fixtures.js";

const UNIQUE_NAME = `E2E UI Product ${Date.now()}`;
const DESCRIPTION = "Описание товара для Playwright e2e, не короче десяти символов.";

test("продавец: разместить товар через модалку", async ({ page }) => {
  await loginViaHeaderModal(page, E2E_SELLER);

  await page.goto("/");
  await page.getByRole("button", { name: "Разместить товар" }).click();

  const dialog = page.getByRole("dialog", { name: "Создание товара" });
  await expect(dialog).toBeVisible();

  await dialog.locator('input[name="productName"]').fill(UNIQUE_NAME);
  await dialog.locator('textarea[name="productDescription"]').fill(DESCRIPTION);
  await dialog.locator('input[name="productPrice"]').fill("250");
  await dialog
    .getByLabel("Ссылка на изображение 1")
    .fill("https://example.com/e2e-ui-product.jpg");

  await pickLeafCategory(dialog, [
    "Электроника",
    "Телефоны",
    "Мобильные телефоны",
    "Смартфоны",
  ]);

  await dialog.getByRole("button", { name: "Создать", exact: true }).click();

  await expect(page).toHaveURL(/\/my-products/, { timeout: 20_000 });
  await expect(
    page.getByText("Товар отправлен на проверку", { exact: false }),
  ).toBeVisible();
});

/**
 * @param {import('@playwright/test').Locator} dialog
 * @param {string[]} labels
 */
async function pickLeafCategory(dialog, labels) {
  for (const label of labels) {
    await dialog.getByRole("option", { name: new RegExp(label) }).click();
  }
}
