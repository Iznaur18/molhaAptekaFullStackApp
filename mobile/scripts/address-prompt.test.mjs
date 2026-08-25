import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

const isAddressPromptCatalogPath = (pathname) => {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === "/" ||
    normalized === "/(tabs)" ||
    normalized === "/(tabs)/index" ||
    normalized === "/catalog" ||
    normalized === "/(tabs)/catalog"
  );
};

test("address prompt catalog paths match home and catalog tabs", () => {
  for (const path of ["/", "/(tabs)", "/(tabs)/index", "/catalog", "/(tabs)/catalog"]) {
    assert.equal(isAddressPromptCatalogPath(path), true, path);
  }
  for (const path of ["/profile", "/profile/edit", "/product/1", "/cart"]) {
    assert.equal(isAddressPromptCatalogPath(path), false, path);
  }

  const session = readMobileFile("features/address-prompt/model/addressPromptSession.ts");
  assert.match(session, /\/\(tabs\)\/catalog/);
  assert.match(session, /profile_address/);
  assert.match(session, /seenByUserId/);
  assert.match(session, /resolveAddressPromptUserId/);
});

test("address prompt host, CTA focus and CMS fallback are wired", () => {
  const layout = readMobileFile("app/_layout.tsx");
  const host = readMobileFile("features/address-prompt/ui/AddressPromptHost.tsx");
  const editScreen = readMobileFile("app/profile/edit.tsx");
  const editForm = readMobileFile("features/profile-edit/ui/EditProfileForm.tsx");
  const copy = readMobileFile("shared/config/appUiCopy.ts");
  const cardsHint = readMobileFile("entities/product-badge-explain/ui/ProductBadgeExplainSheet.tsx");

  assert.match(layout, /AddressPromptHost/);
  assert.match(host, /ADDRESS_PROMPT_DELAY_MS/);
  assert.match(host, /focus: "address"/);
  assert.match(host, /primaryActionLabel/);
  assert.match(editScreen, /focusAddress/);
  // Подсказка ведёт в книгу адресов и сразу открывает черновик нового адреса.
  assert.match(editForm, /autoStartAdd=\{focusAddress\}/);
  assert.match(copy, /profile_address:/);
  const limitModal = readMobileFile("entities/product/ui/SellerProductsLimitModal.tsx");
  const regionSelect = readMobileFile("entities/region/ui/RuRegionSelect.tsx");
  assert.match(limitModal, /useRegisterBlockingOverlay/);
  assert.match(regionSelect, /useRegisterBlockingOverlay/);
  assert.match(host, /useBlockingOverlayCount/);
  assert.match(host, /resolveAddressPromptUserId/);
  assert.match(cardsHint, /onPrimaryAction/);
  assert.match(cardsHint, /useRegisterBlockingOverlay/);
});
