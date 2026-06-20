import { describe, expect, it } from "vitest";

import { CREATE_PRODUCT_INITIAL_FORM } from "../../../entities/product/lib/createProductFormState.js";
import { validateProductName } from "../../../entities/product/lib/validateProductName.js";
import { EDIT_PRODUCT_WIZARD_STEP_IDS } from "../lib/editProductWizardSteps.js";
import { validateEditProductWizardStep } from "../lib/validateEditProductWizardStep.js";

const validationContext = {
  sellerPointsMaxPerUnit: 100,
  sellerCatalogCommitted: 0,
};

describe("EDIT_PRODUCT_WIZARD_STEP_IDS", () => {
  it("contains four form steps without manage", () => {
    expect(EDIT_PRODUCT_WIZARD_STEP_IDS).toEqual([
      "basic",
      "media",
      "category",
      "commerce",
    ]);
  });
});

describe("validateEditProductWizardStep", () => {
  it("reuses create validation for form steps", () => {
    expect(
      validateEditProductWizardStep("basic", CREATE_PRODUCT_INITIAL_FORM, validationContext),
    ).toBe(validateProductName(""));
  });
});
