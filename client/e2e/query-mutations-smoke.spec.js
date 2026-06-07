import { expect, test } from "@playwright/test";

import {
  loginAndGetCookieHeader,
  loginViaApiCookies,
  replaceCartItems,
} from "./helpers/api.js";
import {
  E2E_BUYER,
  E2E_FIXTURE,
  E2E_KYC_BUYER,
  E2E_MODERATOR,
  E2E_SAMPLE_IMAGE_PATH,
} from "./helpers/fixtures.js";

const SERVER_URL = "http://127.0.0.1:4444";

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} cookie
 * @param {string} productName
 */
async function findProductIdByName(request, cookie, productName) {
  const response = await request.get(`${SERVER_URL}/product`, {
    headers: { Cookie: cookie },
  });
  if (!response.ok()) {
    throw new Error(`GET /product failed: ${response.status()} ${await response.text()}`);
  }
  const body = await response.json();
  const products = body.data?.products ?? [];
  const product = products.find((item) => String(item.productName) === productName);
  if (!product?._id) {
    throw new Error(`product not found: ${productName}`);
  }
  return String(product._id);
}

test("checkout: корзина → оформление заказа", async ({ page, request }) => {
  const cookie = await loginAndGetCookieHeader(request, E2E_BUYER);
  const productId = await findProductIdByName(
    request,
    cookie,
    E2E_FIXTURE.catalogProductName,
  );
  await replaceCartItems(request, cookie, { [productId]: 1 });

  await loginViaApiCookies(page, request, E2E_BUYER);
  await page.goto("/basket");

  await expect(page.getByText(E2E_FIXTURE.catalogProductName)).toBeVisible({
    timeout: 15_000,
  });

  await page.getByLabel("Адрес доставки").fill("Москва, ул. E2E, д. 1");
  await page.getByRole("button", { name: "Оформить заказ", exact: true }).click();

  await expect(page.getByText(E2E_FIXTURE.catalogProductName).first()).toBeVisible({
    timeout: 20_000,
  });
});

test("moderation: одобрить товар из очереди", async ({ page, request }) => {
  await loginViaApiCookies(page, request, E2E_MODERATOR);
  await page.goto("/me");

  await page.getByRole("button", { name: "На модерации", exact: true }).click();
  const pendingHeading = page.getByRole("heading", {
    name: E2E_FIXTURE.pendingProductName,
    exact: true,
  });
  await expect(pendingHeading).toBeVisible({ timeout: 20_000 });

  await page.getByRole("button", { name: "Одобрить", exact: true }).first().click();

  await expect(pendingHeading).toBeHidden({ timeout: 20_000 });
  await expect(page.getByText("Нет товаров, ожидающих проверки.")).toBeVisible({
    timeout: 15_000,
  });
});

test("story upload: модератор публикует фото-сторис", async ({ page, request }) => {
  await loginViaApiCookies(page, request, E2E_MODERATOR);
  await page.goto("/");

  await page.getByRole("button", { name: "Ваша история" }).click();

  const dialog = page.getByRole("dialog", { name: "Новый сторис" });
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: "Фото", exact: true }).click();
  await dialog.locator('input[type="file"]').first().setInputFiles(E2E_SAMPLE_IMAGE_PATH);

  await expect(dialog.locator(".create-user-story-modal__media")).toBeVisible({
    timeout: 15_000,
  });

  await dialog.getByRole("button", { name: "Опубликовать", exact: true }).click();
  await expect(dialog).toBeHidden({ timeout: 30_000 });
});

test("KYC submit: покупатель подаёт заявку на подтверждение данных", async ({
  page,
  request,
}) => {
  await loginViaApiCookies(page, request, E2E_KYC_BUYER);
  await page.goto("/me");

  await page.getByRole("button", { name: "Подтверждение", exact: true }).click();
  await page.getByRole("button", { name: "Подать заявку", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: "Подтверждение данных" });
  await expect(dialog).toBeVisible();

  await dialog.getByLabel("Фамилия").fill("Иванов");
  await dialog.getByLabel("Имя").fill("Иван");
  await dialog.getByLabel("Отчество").fill("Иванович");
  await dialog.getByLabel("Дата рождения").fill("1990-01-15");
  await dialog.getByLabel("Серия").fill("1234");
  await dialog.getByLabel("Номер").fill("567890");
  await dialog.getByLabel("Кем выдан").fill("ОВД E2E города Москвы");
  await dialog.getByLabel("Дата выдачи").fill("2010-06-20");
  await dialog.getByLabel("Код подразделения").fill("770-001");

  await dialog.getByLabel("Выбрать изображение с устройства").setInputFiles(
    E2E_SAMPLE_IMAGE_PATH,
  );
  await expect(dialog.getByText("sample-upload.png")).toBeVisible({ timeout: 10_000 });

  await dialog.getByRole("button", { name: "Отправить заявку", exact: true }).click();

  await expect(dialog).toBeHidden({ timeout: 30_000 });
  await expect(
    page.getByText("Заявка на рассмотрении. Дождитесь решения модератора."),
  ).toBeVisible();
});
