import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("installment sales page mirrors web toolbar and compact seller contract card", () => {
  const page = readMobileFile("features/installment-sales-page/ui/InstallmentSalesPage.tsx");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /InstallmentPaymentsPageToolbar/);
  assert.match(page, /InstallmentPaymentsOverview/);
  assert.match(page, /collapsible/);
  assert.match(page, /contractNeedsSellerAttention/);
  assert.match(page, /COUNT_FILTERED/);
  assert.match(page, /SALES_PAGE_TITLE/);
  assert.match(page, /ListHeaderComponent/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /useProfileAdaptiveLayout/);
  assert.match(page, /listInAccountShell/);
  assert.match(page, /listItemFirst/);
  assert.match(page, /ProfileAccountList/);
  assert.match(page, /role="seller"/);
  assert.match(page, /compact/);
  assert.match(page, /onCounterpartyClick/);
  assert.match(page, /onProductClick/);
  assert.match(page, /installment-sales/);
  assert.doesNotMatch(page, /useOrdersScreenStyles/);

  const pageStyles = readMobileFile("shared/theme/installmentPaymentsPageStyles.ts");
  assert.match(pageStyles, /INSTALLMENT_PAGE_LAYOUT/);
  assert.match(pageStyles, /listInAccountShell/);
});

test("installment sales page ui copy matches web sales toolbar", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /SALES_PAGE_TITLE: "Продажи - Рассрочка"/);
  assert.match(copy, /SALES_PAGE_EMPTY: "Продаж в рассрочку пока нет\."/);
});
