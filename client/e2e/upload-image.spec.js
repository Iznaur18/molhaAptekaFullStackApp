import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "./helpers/test.js";

import { loginViaApiCookies } from "./helpers/api.js";
import { E2E_BUYER } from "./helpers/fixtures.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_IMAGE_PATH = path.join(__dirname, "fixtures/sample-upload.png");

test("auth user: upload image returns /uploads/ url", async ({ page, request }) => {
  await loginViaApiCookies(page, request, E2E_BUYER);

  await page.goto("/me");
  await page.getByRole("button", { name: "Изменить профиль" }).click();

  const dialog = page.getByRole("dialog", { name: "Редактирование профиля" });
  await expect(dialog).toBeVisible({ timeout: 15_000 });

  const uploadResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/upload") &&
      response.request().method() === "POST" &&
      response.status() === 200,
  );

  await dialog
    .getByLabel("Выбрать изображение с устройства")
    .first()
    .setInputFiles(SAMPLE_IMAGE_PATH);

  const uploadResponse = await uploadResponsePromise;
  const uploadBody = await uploadResponse.json();
  const uploadedUrl = String(uploadBody?.data?.url ?? "");

  expect(uploadedUrl).toMatch(/\/uploads\/.+/);
  await expect(dialog.getByLabel("Аватар (ссылка или файл)")).toHaveValue(/\/uploads\/.+/);
});
