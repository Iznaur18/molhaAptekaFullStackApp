import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  buildDealRequestDayOptions,
  clampDealRequestTimeToFuture,
  dealRequestTimePartsToIso,
  defaultDealRequestTime,
  DEAL_REQUEST_DAY_OPTIONS,
  DEAL_REQUEST_MINUTES,
  isDealRequestTimeInPast,
  toDealRequestTimeParts,
} from "../entities/deal-request/lib/dealRequestTime.ts";
import { resolveWebPathToMobileRoute } from "../features/deep-linking/lib/resolveWebPathToMobileRoute.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");
const LABELS = { today: "Сегодня", tomorrow: "Завтра" };

test("время заявки: две недели чипов, шаг 15 минут, завтра в 12:00 по умолчанию", () => {
  const now = new Date(2026, 9, 20, 15, 7);
  const days = buildDealRequestDayOptions(now, LABELS);
  assert.equal(days.length, DEAL_REQUEST_DAY_OPTIONS);
  assert.equal(days[0].label, "Сегодня");
  assert.equal(days[1].label, "Завтра");
  assert.equal(days[2].label, "Чт 22 окт");
  assert.deepEqual(DEAL_REQUEST_MINUTES, [0, 15, 30, 45]);

  const parts = toDealRequestTimeParts(defaultDealRequestTime(now));
  assert.equal(parts.hour, 12);
  assert.equal(parts.minute, 0);
  assert.equal(parts.dayValue, days[1].value);

  const iso = dealRequestTimePartsToIso(parts);
  assert.equal(new Date(iso).getTime(), new Date(2026, 9, 21, 12, 0).getTime());
  assert.equal(isDealRequestTimeInPast(iso, now), false);
  assert.equal(dealRequestTimePartsToIso({ dayValue: parts.dayValue }), null);
});

test("время заявки: «Сегодня» с прошедшим часом сдвигается на ближайший слот", () => {
  const now = new Date(2026, 9, 20, 15, 7);
  const today = toDealRequestTimeParts(now).dayValue;
  assert.deepEqual(
    clampDealRequestTimeToFuture({ dayValue: today, hour: 12, minute: 0 }, now),
    {
      dayValue: today,
      hour: 15,
      minute: 15,
    },
  );
  const later = { dayValue: today, hour: 18, minute: 30 };
  assert.deepEqual(clampDealRequestTimeToFuture(later, now), later);
});

test("время заявки: ряд дней дотягивается до выбранного дальше двух недель", () => {
  const now = new Date(2026, 9, 20, 9, 0);
  const far = new Date(2026, 10, 15, 10, 0);
  const days = buildDealRequestDayOptions(now, LABELS, far);
  assert.equal(days.at(-1).value, toDealRequestTimeParts(far).dayValue);
});

test("раздел «Заявки» в профиле и ссылка с сайта ведут в приложение", () => {
  const sections = read("../packages/shared-lib/src/profileSections.ts");
  assert.match(sections, /PROFILE_SECTION_DEAL_REQUESTS = "deal-requests"/);
  assert.match(
    read("features/profile-hub/ui/HubSectionContent.tsx"),
    /<DealRequestsPage \/>/,
  );
  assert.match(
    read("features/profile-hub/model/buildProfileNavGroups.ts"),
    /MY_PROFILE_PAGE_UI\.TAB_DEAL_REQUESTS/,
  );
  assert.equal(
    resolveWebPathToMobileRoute("/profile/deal-requests"),
    "/hub/deal-requests",
  );
});

test("тексты заявок совпадают с сайтом", () => {
  const web = read("../client/src/shared/config/copy/deal-requests.js");
  const mobile = read("shared/config/appUiCopy.ts");
  for (const key of [
    "SENT_TITLE",
    "SENT_HINT",
    "PHONE_MISSING",
    "LEAD",
    "EMPTY_BUYER",
    "EMPTY_SELLER",
    "PHONE_LOCKED",
    "COMPLETED_VIEWING_HINT",
    "ACCEPT_PRICE_REQUIRED",
  ]) {
    const value = new RegExp(`${key}:\\s*"([^"]+)"`).exec(web)?.[1];
    assert.ok(value, key);
    assert.ok(mobile.includes(`"${value}"`), key);
  }
});

test("заявка: действия как на сайте, ошибки видны пользователю", () => {
  const card = read("entities/deal-request/ui/DealRequestCard.tsx");
  assert.match(card, /onAction\("outcome", \{ outcome: action \}\)/);
  assert.match(card, /DEAL_REQUESTS_PAGE_UI\.ACCEPT_PRICE_REQUIRED/);
  assert.match(card, /request\.actions\.map/);

  const sheet = read("entities/deal-request/ui/DealRequestSheet.tsx");
  assert.match(sheet, /createMutation\.mutateAsync/);
  assert.match(sheet, /PRODUCT_DEAL_ACTIONS_UI\.TIME_IN_PAST/);
  assert.match(sheet, /setFormError\(\s*error instanceof Error/);
});
