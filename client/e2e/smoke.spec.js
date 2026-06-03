import { expect, test } from "@playwright/test";

test("главная: кнопка «Войти» и загрузка каталога", async ({ page }) => {
  const healthResponse = await page.request.get("http://127.0.0.1:4444/health");
  expect(healthResponse.ok()).toBeTruthy();
  const healthBody = await healthResponse.json();
  expect(healthBody.mongo).toBe("connected");

  await page.goto("/");

  await expect(page.getByRole("button", { name: "Войти" }).first()).toBeVisible({
    timeout: 15_000,
  });
});

test("публичный каталог: GET /product", async ({ request }) => {
  const response = await request.get("http://127.0.0.1:4444/product");
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.success).toBe(true);
  expect(Array.isArray(body.data?.products)).toBe(true);
});
