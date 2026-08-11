import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const COMMERCE_CARD_UI = {
  EXPAND: "раскрыть",
  COLLAPSE: "свернуть",
  EXPAND_TOGGLE_LABEL: (expanded) => (expanded ? "свернуть" : "раскрыть"),
};

test("COMMERCE_CARD_UI expand toggle labels", () => {
  assert.equal(COMMERCE_CARD_UI.EXPAND_TOGGLE_LABEL(false), "раскрыть");
  assert.equal(COMMERCE_CARD_UI.EXPAND_TOGGLE_LABEL(true), "свернуть");
});

test("commerce cards use CommerceCardExpandToggle instead of chevron glyph", () => {
  const toggle = readMobileFile("shared/ui/CommerceCardExpandToggle.tsx");
  const toggleStyles = readMobileFile("shared/theme/commerceCardExpandToggleStyles.ts");
  const orderCard = readMobileFile("entities/order/ui/OrderCard.tsx");
  const buyerBid = readMobileFile("entities/product-price-offer/ui/AuctionBuyerBidRow.tsx");
  const sellerOffer = readMobileFile("entities/product-price-offer/ui/AuctionSellerOfferRow.tsx");
  const installmentCard = readMobileFile("entities/installment/ui/InstallmentContractCard.tsx");

  assert.match(toggle, /COMMERCE_CARD_UI\.EXPAND_TOGGLE_LABEL/);
  assert.match(toggleStyles, /fontSize: 11/);
  assert.doesNotMatch(toggle, /▸/);

  for (const source of [buyerBid, sellerOffer, installmentCard]) {
    assert.match(source, /CommerceCardExpandToggle/);
    assert.doesNotMatch(source, /▸/);
  }

  // OrderCard: main expand uses CommerceCardExpandToggle; details fold keeps ▸ (web parity).
  assert.match(orderCard, /CommerceCardExpandToggle/);
  assert.match(orderCard, /DETAILS_FOLD_SUMMARY/);
});
