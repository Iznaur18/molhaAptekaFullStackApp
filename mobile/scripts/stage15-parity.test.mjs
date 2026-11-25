import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("15.1 notifications item pad/r/gap + clear chrome", () => {
  const styles = readMobile("shared/theme/accountFeatureStyles.ts");
  const page = readMobile("features/notifications-page/ui/NotificationsPage.tsx");
  const webCss = readClient("pages/notifications/ui/NotificationsPage.css");

  assert.match(webCss, /padding:\s*0\.75rem\s+0\.85rem/);
  assert.match(webCss, /border-radius:\s*0\.5rem/);
  assert.match(webCss, /gap:\s*0\.5rem/);
  assert.match(webCss, /padding:\s*0\.4rem\s+0\.85rem/);

  assert.match(styles, /paddingVertical:\s*12/);
  assert.match(styles, /paddingHorizontal:\s*13\.6/);
  assert.match(styles, /borderRadius:\s*theme\.radius\.sm/);
  assert.match(styles, /list:[\s\S]*?gap:\s*8/);
  assert.match(styles, /clearButton:[\s\S]*?paddingVertical:\s*6\.4/);
  assert.match(styles, /clearButton:[\s\S]*?paddingHorizontal:\s*13\.6/);
  assert.match(styles, /actionSoft/);
  assert.match(page, /openNotificationTarget/);
  assert.match(page, /handleClear|markReadMutation/);
});

test("15.2 deal-requests card chrome = web 16/18/9.6", () => {
  const styles = readMobile("shared/theme/dealRequestStyles.ts");
  const page = readMobile("features/deal-requests-page/ui/DealRequestsPage.tsx");
  const card = readMobile("entities/deal-request/ui/DealRequestCard.tsx");
  const webCss = readClient("entities/deal-request/ui/DealRequestCard.css");

  assert.match(webCss, /padding:\s*1rem/);
  assert.match(webCss, /border-radius:\s*1\.125rem/);
  assert.match(webCss, /gap:\s*0\.6rem/);

  assert.match(styles, /card:[\s\S]*?padding:\s*16/);
  assert.match(styles, /card:[\s\S]*?borderRadius:\s*18/);
  assert.match(styles, /card:[\s\S]*?gap:\s*9\.6/);
  assert.match(styles, /cardClosed:[\s\S]*?surfaceMuted/);
  assert.match(styles, /list:[\s\S]*?gap:\s*12/);
  assert.match(page, /DealRequestCard/);
  assert.match(card, /useDealRequestsPageStyles/);
});

test("15.3 safe-deal header/form chrome = web 18/16", () => {
  const styles = readMobile("shared/theme/safeDealPageStyles.ts");
  const page = readMobile("features/safe-deal-page/ui/SafeDealPage.tsx");
  const webCss = readClient("pages/safe-deal/ui/SafeDealPage.css");

  assert.match(webCss, /padding:\s*1\.125rem\s+1rem/);
  assert.match(webCss, /border-radius:\s*1\.125rem/);
  assert.match(webCss, /\.safe-deal-page__form[\s\S]*?padding:\s*1\.125rem/);

  assert.match(styles, /root:[\s\S]*?gap:\s*16/);
  assert.match(styles, /header:[\s\S]*?paddingVertical:\s*18/);
  assert.match(styles, /header:[\s\S]*?paddingHorizontal:\s*16/);
  assert.match(styles, /header:[\s\S]*?borderRadius:\s*18/);
  assert.match(styles, /card:[\s\S]*?padding:\s*18/);
  assert.match(styles, /card:[\s\S]*?borderRadius:\s*18/);
  assert.match(styles, /card:[\s\S]*?gap:\s*16/);
  assert.match(page, /useSafeDealPageStyles/);
  assert.match(page, /normalizeSafeDealInnInput/);
});

test("15.4 FAQ / legal / user profile / installment smoke", () => {
  const faq = readMobile("features/faq/ui/FaqScreen.tsx");
  const legal = readMobile("features/legal/ui/LegalDocumentsScreen.tsx");
  const userRoute = readMobile("app/user/[id].tsx");
  const installment = readMobile(
    "features/installment-payments-page/ui/InstallmentPaymentsPage.tsx",
  );
  const toolbar = readMobile(
    "features/installment-payments-page/ui/InstallmentPaymentsPageToolbar.tsx",
  );
  const layout = readMobile("shared/lib/guestProfileLayout.ts");

  assert.match(faq, /FAQ_SECTIONS|FaqAccordionItem/);
  assert.match(legal, /LegalDocument/);
  assert.match(userRoute, /UserDetailsPage/);
  const userPage = readMobile("features/user-details-page/ui/UserDetailsPage.tsx");
  assert.match(userPage, /UserDetailsPage|useUser|seller/i);
  assert.match(installment, /InstallmentPaymentsPageToolbar|Overview/);
  assert.match(toolbar, /styles\.toolbar/);
  assert.match(layout, /INSTALLMENT_PAGE_LAYOUT[\s\S]*?stackGap:\s*13\.6/);
});
