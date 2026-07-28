import assert from "node:assert/strict";
import { describe, expect, it } from "vitest";

import { CREATE_PRODUCT_INITIAL_FORM } from "../../../entities/product/lib/createProductFormState.js";
import { validateProductName } from "../../../entities/product/lib/validateProductName.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { CREATE_PRODUCT_WIZARD_STEP_IDS } from "../lib/createProductWizardSteps.js";
import { validateCreateProductWizardStep } from "../lib/validateCreateProductWizardStep.js";

const validationContext = {
  sellerPointsMaxPerUnit: 100,
  sellerCatalogCommitted: 0,
};

describe("validateCreateProductWizardStep", () => {
  it("requires name and description on basic step", () => {
    expect(validateCreateProductWizardStep("basic", CREATE_PRODUCT_INITIAL_FORM, validationContext)).toBe(
      validateProductName(""),
    );

    const validBasic = {
      ...CREATE_PRODUCT_INITIAL_FORM,
      productName: "Тестовый товар",
      productDescription: "Описание товара достаточной длины для проверки.",
    };

    expect(validateCreateProductWizardStep("basic", validBasic, validationContext)).toBeNull();
  });

  it("requires listing origin on originality step", () => {
    expect(
      validateCreateProductWizardStep(
        "originality",
        CREATE_PRODUCT_INITIAL_FORM,
        validationContext,
      ),
    ).toBe(CREATE_PRODUCT_MODAL_UI.ERROR_LISTING_ORIGIN);

    expect(
      validateCreateProductWizardStep(
        "originality",
        { ...CREATE_PRODUCT_INITIAL_FORM, productListingOrigin: "own" },
        validationContext,
      ),
    ).toBeNull();
  });

  it("validates commerce step price and stock", () => {
    const form = {
      ...CREATE_PRODUCT_INITIAL_FORM,
      productPrice: "",
      productStockQuantity: "1",
      loyaltyPointsPerUnit: "0",
    };

    expect(validateCreateProductWizardStep("commerce", form, validationContext)).toBe(
      CREATE_PRODUCT_MODAL_UI.ERROR_PRICE,
    );
  });

  it("requires return choice on returns step", () => {
    expect(
      validateCreateProductWizardStep("returns", CREATE_PRODUCT_INITIAL_FORM, validationContext),
    ).toBe(CREATE_PRODUCT_MODAL_UI.ERROR_RETURN_CHOICE);

    expect(
      validateCreateProductWizardStep(
        "returns",
        { ...CREATE_PRODUCT_INITIAL_FORM, productReturnEnabled: false },
        validationContext,
      ),
    ).toBeNull();
  });

  it("covers all wizard steps", () => {
    for (const stepId of CREATE_PRODUCT_WIZARD_STEP_IDS) {
      assert.doesNotThrow(() => {
        validateCreateProductWizardStep(stepId, CREATE_PRODUCT_INITIAL_FORM, validationContext);
      });
    }
  });
});
