import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("installment disputes page mirrors web layout and hub chrome", () => {
  const page = readMobileFile("features/installment-disputes-page/ui/InstallmentDisputesPage.tsx");
  const styles = readMobileFile("shared/theme/installmentDisputesPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /ProfileAccountScrollBody/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /InstallmentDisputesPageToolbar/);
  assert.match(page, /InstallmentDisputesQueueCard/);
  assert.match(page, /removeFromQueue/);
  assert.match(page, /partial_refund/);
  assert.match(page, /activeSectionId="installment-disputes"/);
  assert.match(page, /TAB_INSTALLMENT_DISPUTES/);
  assert.doesNotMatch(page, /StaffModerationActions/);
  assert.doesNotMatch(page, /staffQueueStyles/);
  assert.doesNotMatch(page, /AppButton/);

  assert.match(styles, /amountInput/);
});

test("installment disputes queue card mirrors web fields and actions", () => {
  const card = readMobileFile("entities/installment/ui/InstallmentDisputesQueueCard.tsx");

  assert.match(card, /DISPUTE_CONTRACT_LABEL/);
  assert.match(card, /SELLER_LABEL/);
  assert.match(card, /BUYER_LABEL/);
  assert.match(card, /\/user\/\[id\]/);
  assert.match(card, /DISPUTE_RESOLVE_NOTE/);
  assert.match(card, /DISPUTE_PARTIAL_AMOUNT/);
  assert.match(card, /DISPUTE_ACTION_CLOSE/);
  assert.match(card, /DISPUTE_ACTION_REFUND/);
  assert.match(card, /adjust_schedule/);
});

test("installment disputes ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /COUNT_DISPUTES: \(count: number\) => `\$\{count\} споров`/);
  assert.match(copy, /DISPUTE_ACTION_CLOSE: "Закрыть договор"/);
  assert.match(copy, /DISPUTE_ACTION_ADJUST: "Сдвинуть график"/);
});
