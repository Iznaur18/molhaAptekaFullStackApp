import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  BOOST_HOME_CARD_GAP,
  BOOST_HOME_CARD_MAX_WIDTH,
  BOOST_HOME_CARD_MIN_WIDTH,
  resolveBoostHomeCardHeight,
  resolveBoostHomeCardWidth,
} from "../entities/product/lib/boostProductsHomeLayout.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("boost card width mirrors web clamp(8.5rem, 23%, 11rem)", () => {
  assert.equal(BOOST_HOME_CARD_GAP, 10);
  assert.equal(BOOST_HOME_CARD_MIN_WIDTH, 136);
  assert.equal(BOOST_HOME_CARD_MAX_WIDTH, 176);
  assert.equal(resolveBoostHomeCardWidth(200), 136);
  assert.equal(resolveBoostHomeCardWidth(700), 161);
  assert.equal(resolveBoostHomeCardWidth(1200), 176);
  assert.equal(resolveBoostHomeCardHeight(150), 150);
});

test("boost mini-card keeps price overlay + wishlist", () => {
  const mini = readMobileFile("entities/product/ui/BoostProductMiniCard.tsx");
  const styles = readMobileFile("shared/theme/boostProductsHomeStyles.ts");

  assert.match(mini, /WishlistToggleButton/);
  assert.match(mini, /priceWrap/);
  assert.match(styles, /priceWrap:[\s\S]*position: "absolute"/);
  assert.match(styles, /wishlistSlot:[\s\S]*position: "absolute"/);
});
