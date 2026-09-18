import assert from "node:assert/strict";
import test from "node:test";

import {
  LEGAL_RANKING_RULES_SECTIONS,
  LEGAL_RANKING_RULES_UPDATED_AT,
  buildMarketplaceNotSellerNotice,
} from "../dist/index.js";

test("buildMarketplaceNotSellerNotice names the seller when known", () => {
  const text = buildMarketplaceNotSellerNotice("  Магазин Ахмата ");
  assert.match(text, /^Gitorg — площадка, а не продавец\./);
  assert.match(text, /Товар продаёт Магазин Ахмата:/);
});

test("buildMarketplaceNotSellerNotice falls back without a name", () => {
  for (const empty of ["", "   ", null, undefined]) {
    const text = buildMarketplaceNotSellerNotice(empty);
    assert.match(text, /^Gitorg — площадка, а не продавец\./);
    assert.doesNotMatch(text, /Товар продаёт/);
  }
});

test("ranking rules are complete and non-empty", () => {
  assert.ok(LEGAL_RANKING_RULES_UPDATED_AT.trim().length > 0);
  assert.ok(LEGAL_RANKING_RULES_SECTIONS.length >= 8);
  for (const section of LEGAL_RANKING_RULES_SECTIONS) {
    assert.ok(section.title.trim().length > 0);
    assert.ok(section.paragraphs.length > 0);
    for (const paragraph of section.paragraphs) {
      assert.ok(paragraph.trim().length > 0, section.title);
    }
  }
});

test("ranking rules name every paid promotion badge shown in the catalog", () => {
  const text = LEGAL_RANKING_RULES_SECTIONS.flatMap((s) => s.paragraphs).join(" ");
  for (const badge of ["«Буст»", "«Топ»", "«Баннер»"]) {
    assert.ok(text.includes(badge), badge);
  }
});
