import { expect, test } from "./helpers/test.js";

import { claimPromoReturnStreak, loginAndGetCookieHeader } from "./helpers/api.js";
import { loginViaHeaderModal } from "./helpers/auth.js";
import { E2E_SAMPLE_IMAGE_PATH, E2E_SELLER } from "./helpers/fixtures.js";

const UNIQUE_NAME = `E2E UI Product ${Date.now()}`;
const DESCRIPTION = "Описание товара для Playwright e2e, не короче десяти символов.";
/** Точка из «Доставка и оплата» продавца — её кладёт e2ePlaywrightSeed. */
const SELLER_PICKUP_ADDRESS_LINE = "Москва, ул. E2E, д. 1";

test("продавец: разместить товар через пошаговую модалку", async ({
  page,
  request,
}) => {
  const cookie = await loginAndGetCookieHeader(request, E2E_SELLER);
  await claimPromoReturnStreak(request, cookie);
  await loginViaHeaderModal(page, E2E_SELLER);

  await page.goto("/");
  await page.getByRole("button", { name: "Разместить товар", exact: true }).click();

  // Доступное имя диалога — заголовок «Новый товар»: aria-labelledby важнее
  // aria-label «Создание товара», поэтому по нему роль не находилась.
  const dialog = page.getByRole("dialog", { name: "Новый товар" });
  // Мастер подгружается лениво — в dev-сборке Vite компилирует его при первом открытии.
  await expect(dialog).toBeVisible({ timeout: 20_000 });

  const goNext = () =>
    dialog.getByRole("button", { name: "Далее", exact: true }).click();

  // Шаг 1 — категория: плитки дерева до листа.
  await pickLeafCategory(dialog, [
    "Электроника",
    "Телефоны",
    "Мобильные телефоны",
    "Смартфоны",
  ]);
  await expect(
    dialog.locator(".create-product-category-picker__summary"),
  ).toBeVisible();
  await goNext();

  // Шаг 2 — о товаре.
  await dialog.locator('[name="productName"]').fill(UNIQUE_NAME);
  await dialog.locator('[name="productDescription"]').fill(DESCRIPTION);
  await goNext();

  // Шаг 3 — статус товара.
  await dialog.getByRole("button", { name: "Продаю свое", exact: true }).click();
  await goNext();

  // Шаг 4 — медиа: файл сразу уходит в POST /upload, без кадрирования.
  const uploadResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/upload") && response.request().method() === "POST",
  );
  await dialog
    .locator('input[type="file"]')
    .first()
    .setInputFiles(E2E_SAMPLE_IMAGE_PATH);
  expect((await uploadResponsePromise).status()).toBe(200);
  await expect(
    dialog.locator(".create-product-wizard-media-grid__tile-image"),
  ).toHaveCount(1);
  await goNext();

  // Шаг 5 — самовывоз: у продавца заведены «Доставка и оплата», поэтому товар
  // по умолчанию следует профилю — адрес и регион сервер берёт оттуда.
  // (Свой адрес выбирается только на карте, а регион по нему — через DaData,
  // которой в E2E нет.)
  await expect(
    dialog.getByRole("radio", { name: "Как в профиле", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  await expect(dialog.getByText(SELLER_PICKUP_ADDRESS_LINE)).toBeVisible();
  await goNext();

  // Шаг 6 — цена; наличие по умолчанию «есть, 1 шт».
  await dialog.locator('input[name="productPrice"]').fill("250");
  await goNext();

  // Шаг 7 — возврат.
  await dialog
    .getByRole("radiogroup", { name: "Возврат" })
    .getByRole("button", { name: "Нет", exact: true })
    .click();
  await goNext();

  // Шаг 8 — проверка и отправка.
  const createResponsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith("/product") &&
      response.request().method() === "POST",
  );
  await dialog
    .getByRole("button", { name: "Отправить на проверку", exact: true })
    .click();
  const createResponse = await createResponsePromise;
  expect(createResponse.status(), await createResponse.text()).toBeLessThan(300);

  // После создания приложение открывает карточку нового товара.
  await page.waitForURL((url) => url.pathname.startsWith("/product/"), {
    timeout: 20_000,
  });
  await expect(page.getByText(UNIQUE_NAME).first()).toBeVisible({ timeout: 15_000 });
});

/**
 * @param {import('@playwright/test').Locator} dialog
 * @param {string[]} labels
 */
async function pickLeafCategory(dialog, labels) {
  for (const label of labels) {
    await dialog
      .locator(".create-product-category-picker__grid")
      .getByRole("button", { name: label, exact: true })
      .click();
  }
}
