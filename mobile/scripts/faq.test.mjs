import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("faq screen is wired from header menu and stack route", () => {
  const items = readMobileFile("features/home-feed/lib/buildHomeCatalogUsersMenuItems.ts");
  const button = readMobileFile("features/home-feed/ui/HomeCatalogUsersButton.tsx");
  const route = readMobileFile("app/faq.tsx");
  const layout = readMobileFile("app/_layout.tsx");
  const screen = readMobileFile("features/faq/ui/FaqScreen.tsx");
  const accordion = readMobileFile("features/faq/ui/FaqAccordionItem.tsx");
  const content = readMobileFile("features/faq/model/faqContent.ts");
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(items, /key: "faq"/);
  assert.match(items, /href: "\/faq"/);
  assert.match(items, /icon: "quiz"/);
  assert.match(button, /isFaqActive/);
  assert.match(button, /"faq"/);
  assert.match(route, /FaqScreen/);
  assert.match(layout, /name="faq"/);
  assert.match(layout, /FAQ_UI\.TITLE/);
  assert.match(screen, /FAQ_SECTIONS/);
  assert.match(screen, /FaqAccordionItem/);
  assert.match(accordion, /accessibilityState=\{\{ expanded \}\}/);
  assert.match(content, /LEGAL_CONTACT_EMAIL/);
  assert.match(content, /FAQ_SECTIONS/);
  assert.match(copy, /FAQ_UI/);
  assert.match(copy, /MENU_ITEM_FAQ_ARIA/);
});

test("faq content covers buyer and seller flows", () => {
  const content = readMobileFile("features/faq/model/faqContent.ts");

  assert.match(content, /id: "buying"/);
  assert.match(content, /id: "selling"/);
  assert.match(content, /id: "catalog"/);
  assert.match(content, /id: "premium-loyalty"/);
  assert.match(content, /id: "safety"/);
  assert.match(content, /id: "buy"/);
  assert.match(content, /id: "sell"/);
  assert.match(content, /id: "moderation"/);
  assert.match(content, /id: "auction"/);
  assert.match(content, /id: "premium"/);
  assert.match(content, /id: "loyalty-points"/);
  assert.match(content, /id: "data-confirmation"/);
  assert.match(content, /id: "promotion"/);
  assert.match(content, /id: "subscriptions"/);
  assert.match(content, /id: "reviews"/);
  assert.match(content, /id: "product-qa"/);
  assert.match(content, /id: "compare"/);
  assert.match(content, /id: "wholesale"/);
  assert.match(content, /id: "affiliate-listing"/);
  assert.match(content, /id: "partner-program"/);
  assert.match(content, /id: "region-near"/);
  assert.match(content, /id: "pickup-map"/);
  assert.match(content, /id: "badges"/);
  assert.match(content, /id: "seller-rating"/);
  assert.match(content, /id: "checkout-fulfillment"/);
});
