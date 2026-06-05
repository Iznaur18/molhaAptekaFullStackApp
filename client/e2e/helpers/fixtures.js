/** @typedef {{ email: string; password: string }} E2eCredentials */

/** Синхрон с `server/scripts/e2ePlaywrightSeed.js` */
export const E2E_FIXTURE = {
  buyerEmail: "e2e-buyer@example.com",
  sellerEmail: "e2e-seller-new@example.com",
  password: "E2eTestPass12!",
  catalogProductName: "E2E Playwright Catalog Item",
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
