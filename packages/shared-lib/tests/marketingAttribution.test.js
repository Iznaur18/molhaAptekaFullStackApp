import assert from "node:assert/strict";
import test from "node:test";

import {
  MARKETING_LAST_TOUCH_TTL_MS,
  mergeMarketingAttribution,
  readMarketingTouch,
  sanitizeMarketingAttribution,
  selectMarketingAttributionForSubmit,
  summarizeMarketingTouch,
} from "../dist/index.js";

const NOW = new Date("2026-09-17T10:00:00.000Z");
const SITE = ["gitorg.ru"];

test("readMarketingTouch: UTM tags win and are lowercased", () => {
  const touch = readMarketingTouch({
    search:
      "?utm_source=Telegram&utm_medium=Post&utm_campaign=2026-10_Grozny&utm_content=Banner A",
    referrer: "https://t.me/some_channel",
    landingPath: "/product/42",
    siteHosts: SITE,
    now: NOW,
  });
  assert.deepEqual(touch, {
    source: "telegram",
    medium: "post",
    campaign: "2026-10_grozny",
    content: "Banner A",
    term: "",
    clickId: "",
    referrerHost: "t.me",
    landingPath: "/product/42",
    capturedAt: NOW.toISOString(),
  });
});

test("readMarketingTouch: yclid without UTM is Yandex paid traffic", () => {
  const touch = readMarketingTouch({ search: "?yclid=123", siteHosts: SITE, now: NOW });
  assert.equal(touch?.source, "yandex");
  assert.equal(touch?.medium, "cpc");
  assert.equal(touch?.clickId, "123");
});

test("readMarketingTouch: search engine referrer is organic", () => {
  const touch = readMarketingTouch({
    search: "",
    referrer: "https://www.yandex.ru/search/?text=gitorg",
    siteHosts: SITE,
    now: NOW,
  });
  assert.equal(touch?.source, "yandex");
  assert.equal(touch?.medium, "organic");
});

test("readMarketingTouch: other external site is a referral", () => {
  const touch = readMarketingTouch({
    search: "",
    referrer: "https://vk.com/wall-1_2",
    siteHosts: SITE,
    now: NOW,
  });
  assert.equal(touch?.source, "vk.com");
  assert.equal(touch?.medium, "referral");
});

test("readMarketingTouch: direct and internal visits give no touch", () => {
  assert.equal(readMarketingTouch({ search: "", siteHosts: SITE, now: NOW }), null);
  assert.equal(
    readMarketingTouch({
      search: "?page=2",
      referrer: "https://gitorg.ru/catalog",
      siteHosts: SITE,
      now: NOW,
    }),
    null,
  );
  assert.equal(
    readMarketingTouch({
      search: "",
      referrer: "https://api.gitorg.ru/x",
      siteHosts: SITE,
      now: NOW,
    }),
    null,
  );
});

test("readMarketingTouch: long values are truncated", () => {
  const touch = readMarketingTouch({
    search: `?utm_source=${"a".repeat(300)}`,
    landingPath: `/${"p".repeat(400)}`,
    siteHosts: SITE,
    now: NOW,
  });
  assert.equal(touch?.source.length, 100);
  assert.equal(touch?.landingPath.length, 200);
});

test("mergeMarketingAttribution: first touch sticks, last touch updates", () => {
  const first = readMarketingTouch({
    search: "?utm_source=vk",
    siteHosts: SITE,
    now: NOW,
  });
  const later = readMarketingTouch({
    search: "?utm_source=telegram",
    siteHosts: SITE,
    now: new Date(NOW.getTime() + 1000),
  });

  const afterFirst = mergeMarketingAttribution(null, first);
  assert.equal(afterFirst?.firstTouch?.source, "vk");
  assert.equal(afterFirst?.lastTouch?.source, "vk");

  const afterSecond = mergeMarketingAttribution(afterFirst, later);
  assert.equal(afterSecond?.firstTouch?.source, "vk");
  assert.equal(afterSecond?.lastTouch?.source, "telegram");

  const afterDirect = mergeMarketingAttribution(afterSecond, null);
  assert.equal(afterDirect?.lastTouch?.source, "telegram");
  assert.equal(mergeMarketingAttribution(null, null), null);
});

test("selectMarketingAttributionForSubmit: drops a last touch older than 30 days", () => {
  const touch = readMarketingTouch({
    search: "?utm_source=vk",
    siteHosts: SITE,
    now: NOW,
  });
  const stored = mergeMarketingAttribution(null, touch);

  const fresh = selectMarketingAttributionForSubmit(
    stored,
    new Date(NOW.getTime() + MARKETING_LAST_TOUCH_TTL_MS),
  );
  assert.equal(fresh?.lastTouch?.source, "vk");

  const stale = selectMarketingAttributionForSubmit(
    stored,
    new Date(NOW.getTime() + MARKETING_LAST_TOUCH_TTL_MS + 1),
  );
  assert.equal(stale?.firstTouch?.source, "vk");
  assert.equal(stale?.lastTouch, null);
});

test("sanitizeMarketingAttribution: rejects garbage and keeps valid touches", () => {
  assert.equal(sanitizeMarketingAttribution(null), null);
  assert.equal(sanitizeMarketingAttribution("x"), null);
  assert.equal(sanitizeMarketingAttribution({ firstTouch: { source: "" } }), null);
  assert.equal(
    sanitizeMarketingAttribution({ firstTouch: { source: "vk", capturedAt: "nope" } }),
    null,
  );

  const clean = sanitizeMarketingAttribution({
    firstTouch: {
      source: " VK ",
      medium: 5,
      capturedAt: NOW.toISOString(),
      extra: "dropped",
    },
    lastTouch: { source: "x" },
  });
  assert.deepEqual(clean, {
    firstTouch: {
      source: "vk",
      medium: "",
      campaign: "",
      content: "",
      term: "",
      clickId: "",
      referrerHost: "",
      landingPath: "",
      capturedAt: NOW.toISOString(),
    },
    lastTouch: null,
  });
});

test("summarizeMarketingTouch keeps only channel fields", () => {
  const touch = readMarketingTouch({
    search: "?utm_source=vk&utm_medium=post&utm_campaign=c&utm_term=t",
    siteHosts: SITE,
    now: NOW,
  });
  assert.deepEqual(summarizeMarketingTouch(touch), {
    source: "vk",
    medium: "post",
    campaign: "c",
  });
  assert.equal(summarizeMarketingTouch(null), null);
});
