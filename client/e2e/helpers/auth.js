import { expect } from "@playwright/test";

/**
 * Вход через страницу /login.
 *
 * Раньше «Войти» в шапке открывал модалку «Вход в аккаунт»; теперь вход — это
 * отдельная страница (LoginPage), а после успеха приложение уводит на /me.
 * Имя функции сохранено, чтобы не трогать все спеки, которые её зовут.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ email: string; password: string }} credentials
 */
export async function loginViaHeaderModal(page, { email, password }) {
  await page.goto("/login");

  const form = page.locator("form.auth-page__form");
  await expect(form).toBeVisible();

  await form.locator('input[name="email"]').fill(email);
  await form.locator('input[name="password"]').fill(password);
  await form.getByRole("button", { name: "Войти", exact: true }).click();

  await page.waitForURL(
    (url) => url.pathname === "/me" || url.pathname.startsWith("/me/"),
    { timeout: 15_000 },
  );
}
