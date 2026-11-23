import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("13.1 skip originality for non-cart deals", () => {
  const steps = readMobile(
    "features/create-product/lib/resolveProductWizardStepIds.ts",
  );
  const screen = readMobile("features/create-product/ui/CreateProductScreen.tsx");
  const webSteps = readClient(
    "features/create-product-wizard/lib/createProductWizardSteps.js",
  );
  const webWizard = readClient(
    "features/create-product-wizard/model/useCreateProductWizard.js",
  );

  assert.match(webSteps, /resolveProductWizardStepIds/);
  assert.match(webSteps, /isCartDealType/);
  assert.match(webSteps, /originality/);
  assert.match(webWizard, /resolveProductWizardStepIds\(form\.categoryDealType\)/);

  assert.match(steps, /resolveProductWizardStepIds/);
  assert.match(steps, /isCartDealType/);
  assert.match(steps, /stepId !== "originality"/);
  assert.match(screen, /resolveProductWizardStepIds\(form\.categoryDealType\)/);
  assert.match(screen, /categoryDealType/);
  assert.match(screen, /PRODUCT_LISTING_ORIGIN_OWN/);
});

test("13.2 deal terms on commerce step", () => {
  const fields = readMobile(
    "features/create-product/ui/CreateProductDealTermsFields.tsx",
  );
  const build = readMobile("entities/product/lib/buildProductDealTermsFields.ts");
  const screen = readMobile("features/create-product/ui/CreateProductScreen.tsx");
  const copy = readMobile("shared/config/appUiCopy.ts");
  const webFields = readClient(
    "entities/product/ui/create-product-sections/CreateProductDealTermsFields.jsx",
  );
  const webCommerce = readClient(
    "entities/product/ui/create-product-sections/CreateProductCommerceSection.jsx",
  );

  assert.match(webFields, /CATEGORY_DEAL_TYPE_SERVICE/);
  assert.match(webFields, /PRODUCT_SERVICE_PRICE_MODES/);
  assert.match(webCommerce, /CreateProductDealTermsFields/);

  assert.match(fields, /CATEGORY_DEAL_TYPE_SERVICE/);
  assert.match(fields, /PRODUCT_SERVICE_PRICE_MODES/);
  assert.match(fields, /PRODUCT_SERVICE_LOCATIONS/);
  assert.match(build, /CATEGORY_DEAL_TYPE_SERVICE/);
  assert.match(screen, /CreateProductDealTermsFields/);
  assert.match(screen, /buildProductDealTermsFields/);
  assert.match(copy, /PRODUCT_DEAL_TERMS_UI/);
  assert.match(copy, /Условия услуги/);
});

test("13.3 Instagram URL card on media step", () => {
  const card = readMobile(
    "features/create-product/ui/CreateProductWizardInstagramLinkCard.tsx",
  );
  const screen = readMobile("features/create-product/ui/CreateProductScreen.tsx");
  const api = readMobile("entities/product/api/createProduct.ts");
  const copy = readMobile("shared/config/appUiCopy.ts");
  const webCard = readClient(
    "features/create-product-wizard/ui/CreateProductWizardInstagramLinkCard.jsx",
  );
  const webMedia = readClient(
    "features/create-product-wizard/ui/CreateProductWizardMediaStep.jsx",
  );

  assert.match(webCard, /WIZARD_MEDIA_INSTAGRAM_TITLE/);
  assert.match(webMedia, /CreateProductWizardInstagramLinkCard/);

  assert.match(card, /WIZARD_MEDIA_INSTAGRAM_TITLE/);
  assert.match(card, /WIZARD_MEDIA_INSTAGRAM_PLACEHOLDER/);
  assert.match(screen, /CreateProductWizardInstagramLinkCard/);
  assert.match(screen, /productInstagramPostUrl/);
  assert.match(screen, /validateInstagramPostUrlInput/);
  assert.match(api, /productInstagramPostUrl/);
  assert.match(copy, /WIZARD_MEDIA_INSTAGRAM_TITLE: "Ссылка из Instagram"/);
});

test("13.4 wizard footer gaps + progress UI", () => {
  const layout = readMobile("shared/theme/screenContentLayout.ts");
  const screen = readMobile("features/create-product/ui/CreateProductScreen.tsx");
  const webCss = readClient(
    "shared/ui/ProductWizardProgress/ProductWizardProgress.css",
  );
  const webFooter = readClient(
    "features/create-product-wizard/ui/CreateProductWizard.css",
  );
  const webProgress = readClient(
    "shared/ui/ProductWizardProgress/ProductWizardProgress.jsx",
  );

  assert.match(layout, /WIZARD_FOOTER_BOTTOM_GAP_PHONE = 12/);
  assert.match(layout, /WIZARD_FOOTER_BOTTOM_GAP_TABLET = 32/);
  assert.match(screen, /resolveWizardFooterPaddingBottom/);
  assert.match(webFooter, /padding-bottom:\s*max\(0\.75rem/);

  assert.match(webCss, /min-width:\s*4\.5rem/);
  assert.match(webCss, /gap:\s*1rem/);
  assert.match(webProgress, /WIZARD_STEP_OF/);
  assert.match(screen, /minWidth: 72/);
  assert.match(screen, /gap: 16/);
  assert.match(screen, /ScrollView/);
  assert.match(screen, /WIZARD_STEP_OF/);
  assert.match(screen, /horizontal/);
});
