import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const read = (root, rel) => readFileSync(join(root, rel), "utf8");

test("checkout fulfillment section matches web cart live pad/gap/radius", () => {
  const formStyles = read(MOBILE_ROOT, "shared/theme/formChromeStyles.ts");
  const webCss = read(CLIENT_ROOT, "src/shared/ui/CheckoutForm/CheckoutForm.css");
  const cartCss = read(
    CLIENT_ROOT,
    "src/features/checkout/ui/CheckoutFulfillmentCards.css",
  );

  assert.match(
    formStyles,
    /fulfillmentSection:[\s\S]*gap: 12[\s\S]*paddingHorizontal: 16[\s\S]*paddingVertical: 14[\s\S]*borderRadius: 16/,
  );
  assert.match(
    formStyles,
    /fulfillmentSectionDelivery:[\s\S]*backgroundColor:\s*theme\.colors\.actionSoft/,
  );
  assert.match(webCss, /\.checkout-form__fulfillment-section \{[\s\S]*gap: 0\.75rem/);
  assert.match(
    cartCss,
    /\.cart-fulfillment__details \.checkout-form__fulfillment-section \{[\s\S]*padding: 14px 16px[\s\S]*border-radius: 16px/,
  );
});

test("checkout payment method cards match web picker live sizes", () => {
  const layout = read(
    MOBILE_ROOT,
    "entities/order/lib/checkoutPaymentMethodCardTheme.ts",
  );
  const picker = read(
    MOBILE_ROOT,
    "features/checkout/ui/CheckoutPaymentMethodPicker.tsx",
  );
  const webCss = read(
    CLIENT_ROOT,
    "src/features/checkout/ui/CheckoutPaymentMethodPicker.css",
  );

  assert.match(layout, /minHeight: 52/);
  assert.match(layout, /borderRadius: 12/);
  assert.match(layout, /paddingVertical: 8/);
  assert.match(layout, /paddingHorizontal: 12/);
  assert.match(layout, /gap: 8/);
  assert.match(picker, /ScrollView/);
  assert.match(webCss, /min-height: 3\.25rem/);
  assert.match(webCss, /padding: 0\.5rem 0\.75rem/);
  assert.match(webCss, /border-radius: 0\.75rem/);
});
