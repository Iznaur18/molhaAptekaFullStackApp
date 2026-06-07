import path from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {{ email: string; password: string }} E2eCredentials */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Синхрон с `server/scripts/e2ePlaywrightSeed.js` */
export const E2E_FIXTURE = {
  buyerEmail: "e2e-buyer@example.com",
  sellerEmail: "e2e-seller-new@example.com",
  moderatorEmail: "e2e-moderator@example.com",
  kycBuyerEmail: "e2e-kyc-buyer@example.com",
  password: "E2eTestPass12!",
  catalogProductName: "E2E Playwright Catalog Item",
  pendingProductName: "E2E Playwright Pending Item",
  virtualCatalogPrefix: "E2E Virtual Catalog",
  virtualCatalogCount: 105,
};

/** @type {E2eCredentials} */
export const E2E_BUYER = {
  email: E2E_FIXTURE.buyerEmail,
  password: E2E_FIXTURE.password,
};

/** @type {E2eCredentials} */
export const E2E_SELLER = {
  email: E2E_FIXTURE.sellerEmail,
  password: E2E_FIXTURE.password,
};

/** @type {E2eCredentials} */
export const E2E_MODERATOR = {
  email: E2E_FIXTURE.moderatorEmail,
  password: E2E_FIXTURE.password,
};

/** @type {E2eCredentials} */
export const E2E_KYC_BUYER = {
  email: E2E_FIXTURE.kycBuyerEmail,
  password: E2E_FIXTURE.password,
};

export const E2E_SAMPLE_IMAGE_PATH = path.join(__dirname, "../fixtures/sample-upload.png");
