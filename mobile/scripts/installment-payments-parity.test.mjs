import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("installment payments page mirrors web toolbar and compact contract card", () => {
  const page = readMobileFile("features/installment-payments-page/ui/InstallmentPaymentsPage.tsx");
  const toolbar = readMobileFile(
    "features/installment-payments-page/ui/InstallmentPaymentsPageToolbar.tsx",
  );
  const card = readMobileFile("entities/installment/ui/InstallmentContractCard.tsx");

  assert.match(page, /PAYMENTS_PAGE_TITLE/);
  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /InstallmentPaymentsPageToolbar/);
  assert.match(page, /InstallmentPaymentsOverview/);
  assert.match(page, /collapsible/);
  assert.match(page, /ListHeaderComponent/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /compact/);
  assert.match(page, /useProfileAdaptiveLayout/);
  assert.match(page, /listInAccountShell/);
  assert.match(page, /listItemFirst/);
  assert.match(page, /ProfileAccountList/);
  assert.match(page, /onCounterpartyClick/);
  assert.match(page, /onProductClick/);
  assert.doesNotMatch(page, /useOrdersScreenStyles/);

  const pageStyles = readMobileFile("shared/theme/installmentPaymentsPageStyles.ts");
  assert.match(pageStyles, /INSTALLMENT_PAGE_LAYOUT/);
  assert.match(pageStyles, /listInAccountShell/);
  assert.match(pageStyles, /listItemFirst/);

  const layout = readMobileFile("shared/lib/guestProfileLayout.ts");
  assert.match(layout, /INSTALLMENT_PAGE_LAYOUT/);

  assert.match(toolbar, /contractsCountLabel/);
  assert.match(page, /COUNT_FILTERED/);
  assert.match(toolbar, /resolveInstallmentStatusFilterChipActiveColors/);
  assert.match(toolbar, /CONTRACT_STATUS_FILTER_LABEL/);

  assert.match(card, /InstallmentContractCardSummary/);
  assert.match(card, /headerBadges/);
  assert.match(card, /InstallmentContractCardPayments/);
  assert.match(card, /EARLY_PAYOFF/);
  assert.match(card, /OPEN_DISPUTE/);
});

test("installment payments ui copy matches web contracts toolbar", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /COUNT_CONTRACTS: \(count: number\) => `\$\{count\} договоров`/);
  assert.match(copy, /PAYMENTS_FOCUS_HEADING: "Сейчас"/);
  assert.match(copy, /CONTRACT_STATUS_FILTER_LABEL: "Статус"/);
});
