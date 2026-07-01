import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("app intro admin page mirrors web form sections and hub chrome", () => {
  const page = readMobileFile("features/app-intro-admin-page/ui/AppIntroAdminPage.tsx");
  const hook = readMobileFile("features/app-intro-admin-page/model/useAppIntroAdminPage.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /activeSectionId="app-intro-admin"/);
  assert.match(page, /TAB_APP_INTRO_ADMIN/);
  assert.match(page, /SECTION_MEDIA/);
  assert.match(page, /SECTION_FALLBACK/);
  assert.match(page, /SECTION_PRIORITY/);
  assert.match(page, /prioritizePlatformIntro/);
  assert.match(page, /LABEL_VIDEO/);
  assert.match(page, /HINT_VIDEO/);
  assert.doesNotMatch(page, /LABEL_VIDEO_WEBM/);
  assert.doesNotMatch(page, /videoWebmUrl/);
  assert.doesNotMatch(page, /staffAdminStyles/);

  assert.match(hook, /previewIntro/);
  assert.match(hook, /replayIntro/);
  assert.match(hook, /validateAppIntroAdminForm/);
});

test("app intro admin form includes prioritize platform intro", () => {
  const form = readMobileFile("entities/app-intro-settings/lib/appIntroAdminForm.ts");

  assert.match(form, /prioritizePlatformIntro/);
  assert.match(form, /buildPatchAppIntroSettingsBody/);
});

test("app intro admin ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /TITLE: "Intro-ролик"/);
  assert.match(copy, /SAVING: "Сохранение…"/);
  assert.match(copy, /SECTION_PRIORITY: "Приоритет показа"/);
  assert.match(copy, /LABEL_VIDEO: "Видео"/);
  assert.match(copy, /сервер конвертирует в MP4/);
});
