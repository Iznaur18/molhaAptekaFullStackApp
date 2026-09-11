import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "./helpers/test.js";

import { loginViaApiCookies } from "./helpers/api.js";
import { E2E_BUYER } from "./helpers/fixtures.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_IMAGE_PATH = path.join(__dirname, "fixtures/sample-upload.png");

test("auth user: upload image returns /uploads/ url", async ({ page, request }) => {
  await loginViaApiCookies(page, request, E2E_BUYER);

  // Редактирование своего профиля — это вкладка внутри /me, а не модалка:
  // диалог «Редактирование профиля» остался только в админском UserDetailsPage.
  await page.goto("/me");
  await page.getByRole("button", { name: "Изменить профиль", exact: true }).click();

  const editPage = page.locator("section.edit-profile-page");
  await expect(
    editPage.getByRole("heading", { name: "Редактирование профиля", level: 1 }),
  ).toBeVisible({ timeout: 15_000 });

  const uploadResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/upload") &&
      response.request().method() === "POST" &&
      response.status() === 200,
  );

  // Аватар грузится через ProfileAvatarUpload: скрытый input → окно
  // кадрирования до квадрата → «Готово» → POST /upload.
  await editPage
    .locator("input.profile-avatar-upload__file")
    .setInputFiles(SAMPLE_IMAGE_PATH);

  const cropDialog = page.getByRole("dialog", { name: "Кадрирование аватара" });
  await expect(cropDialog).toBeVisible({ timeout: 15_000 });
  await cropDialog.getByRole("button", { name: "Готово", exact: true }).click();

  const uploadResponse = await uploadResponsePromise;
  const uploadBody = await uploadResponse.json();
  const uploadedUrl = String(uploadBody?.data?.url ?? "");

  expect(uploadedUrl).toMatch(/\/uploads\/.+/);
  await expect(editPage.locator("img.profile-avatar-upload__image")).toHaveAttribute(
    "src",
    /\/uploads\/.+/,
  );
});
