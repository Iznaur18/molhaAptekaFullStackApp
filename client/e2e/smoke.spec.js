import { expect, test } from "./helpers/test.js";
import { E2E_API_ORIGIN } from "./helpers/urls.js";

test("главная: кнопка «Войти» и загрузка каталога", async ({ page }) => {
  const healthResponse = await page.request.get(`${E2E_API_ORIGIN}/health`);
  expect(healthResponse.ok()).toBeTruthy();
  const healthBody = await healthResponse.json();
  // Публичный /health отдаёт только { status: "ok" } — подробности (mongo и пр.)
  // из него убраны, чтобы не светить устройство сервера наружу.
  expect(healthBody.status).toBe("ok");

  await page.goto("/");
  await expect(
    page.getByRole("navigation", { name: "Основная навигация" }),
  ).toBeVisible({
    timeout: 15_000,
  });

  // Кнопки «Войти» в шапке больше нет: гость попадает на вход через профиль.
  await page.goto("/me");
  await page.getByRole("button", { name: "Перейти", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/login", { timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Войти", exact: true })).toBeVisible();
});

test("публичный каталог: GET /product", async ({ request }) => {
  const response = await request.get(`${E2E_API_ORIGIN}/product`);
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.success).toBe(true);
  expect(Array.isArray(body.data?.products)).toBe(true);
});
