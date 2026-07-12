import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("legal documents include public offer for platform services", () => {
  const presets = readMobileFile("features/legal/model/legalDocumentPresets.ts");
  const offerContent = readMobileFile("features/legal/model/publicOfferContent.ts");
  const offerScreen = readMobileFile("app/legal/offer.tsx");
  const layout = readMobileFile("app/_layout.tsx");
  const userAgreement = readMobileFile("features/legal/model/userAgreementContent.ts");

  assert.match(presets, /offer:/);
  assert.match(presets, /LEGAL_UI\.OFFER_TAB/);
  assert.match(offerContent, /публичной офертой/i);
  assert.match(offerContent, /149 \(сто сорок девять\) баллов/);
  assert.match(offerContent, /6 000 \(шесть тысяч\) баллов/);
  assert.match(offerContent, /не является продавцом таких товаров/);
  assert.match(offerScreen, /initialKind="offer"/);
  assert.match(layout, /legal\/offer/);
  assert.match(userAgreement, /Публичной оферте/);
});
