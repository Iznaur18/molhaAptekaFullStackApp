import { expect } from "@playwright/test";

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ email: string; password: string }} credentials
 */
export async function loginViaHeaderModal(page, { email, password }) {
  await page.goto("/");
  await page.getByRole("button", { name: "Войти" }).first().click();

  const dialog = page.getByRole("dialog", { name: "Вход в аккаунт" });
  await expect(dialog).toBeVisible();

  await dialog.locator('input[name="email"]').fill(email);
  await dialog.locator('input[name="password"]').fill(password);
  await dialog.getByRole("button", { name: "Войти", exact: true }).click();

  await expect(dialog).toBeHidden({ timeout: 15_000 });
}
