import { describe, expect, it } from "vitest";

import { CREATE_PRODUCT_WIZARD_STEP_IDS } from "../../create-product-wizard/lib/createProductWizardSteps.js";
import { CREATE_PRODUCT_INITIAL_FORM } from "../../../entities/product/lib/createProductFormState.js";
import { validateProductName } from "../../../entities/product/lib/validateProductName.js";
import {
  EDIT_PRODUCT_WIZARD_STEP_COUNT,
  EDIT_PRODUCT_WIZARD_STEP_IDS,
} from "../lib/editProductWizardSteps.js";
import { validateEditProductWizardStep } from "../lib/validateEditProductWizardStep.js";

const validationContext = {
  sellerPointsMaxPerUnit: 100,
  sellerCatalogCommitted: 0,
};

describe("EDIT_PRODUCT_WIZARD_STEP_IDS", () => {
  it("matches create wizard steps 1:1 (no manage)", () => {
    expect(EDIT_PRODUCT_WIZARD_STEP_IDS).toEqual([...CREATE_PRODUCT_WIZARD_STEP_IDS]);
    expect(EDIT_PRODUCT_WIZARD_STEP_COUNT).toBe(CREATE_PRODUCT_WIZARD_STEP_IDS.length);
  });
});

describe("validateEditProductWizardStep", () => {
  it("reuses create validation for form steps", () => {
    expect(
      validateEditProductWizardStep("basic", CREATE_PRODUCT_INITIAL_FORM, validationContext),
    ).toBe(validateProductName(""));
  });

  it("validates returns step", () => {
    expect(
      validateEditProductWizardStep(
        "returns",
        { ...CREATE_PRODUCT_INITIAL_FORM, productReturnEnabled: null },
        validationContext,
      ),
    ).not.toBeNull();
  });

  it("review step validates as edit submit", () => {
    expect(
      validateEditProductWizardStep(
        "review",
        {
          ...CREATE_PRODUCT_INITIAL_FORM,
          productName: "Товар для правки",
          productListingOrigin: "own",
          productIsOriginal: true,
          productDescription: "Описание товара достаточной длины для проверки.",
          productPrice: "1500",
          productStockQuantity: "2",
          productImageRows: [{ id: "1", url: "/uploads/product.jpg" }],
          productCategory: "home_garden",
          productRegionCode: "RU-CE",
          productReturnEnabled: false,
          productPickupAddress: "Москва, Тверская улица, 1",
          productPickupLat: 55.75,
          productPickupLon: 37.62,
        },
        validationContext,
      ),
    ).toBeNull();
  });
});
