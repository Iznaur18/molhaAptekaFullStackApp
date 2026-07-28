import { createProductBodySchema } from "@molha/api-contract";
import { describe, expect, it } from "vitest";

import { CREATE_PRODUCT_INITIAL_FORM } from "../../../entities/product/lib/createProductFormState.js";
import { prepareCreateProductSubmit } from "../../../entities/product/lib/prepareCreateProductSubmit.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";

const sellerContext = {
  sellerPointsMaxPerUnit: 100,
  sellerCatalogCommitted: 0,
};

const validForm = {
  ...CREATE_PRODUCT_INITIAL_FORM,
  productName: "Тестовый товар",
  productListingOrigin: "own",
  productIsOriginal: true,
  productDescription: "Описание товара достаточной длины для проверки.",
  productPrice: "1500",
  productStockQuantity: "2",
  productImageRows: [{ id: "1", url: "https://cdn.example.com/product.jpg" }],
  productCategoryId: "507f1f77bcf86cd799439011",
  productRegionCode: "RU-MOW",
  productReturnEnabled: false,
  productPickupAddress: "Москва, Тверская улица, 1",
  productPickupLat: 55.75,
  productPickupLon: 37.62,
};

describe("create product with productListingOrigin", () => {
  it("rejects create without listing origin", () => {
    const prepared = prepareCreateProductSubmit({
      form: { ...validForm, productListingOrigin: null },
      isEdit: false,
      showCatalogAvailabilityToggle: true,
      ...sellerContext,
    });

    expect(prepared.ok).toBe(false);
    if (!prepared.ok) {
      expect(prepared.message).toBe(CREATE_PRODUCT_MODAL_UI.ERROR_LISTING_ORIGIN);
    }
  });

  it("builds createBody with listing origin and passes contract schema", () => {
    const prepared = prepareCreateProductSubmit({
      form: validForm,
      isEdit: false,
      showCatalogAvailabilityToggle: true,
      ...sellerContext,
    });

    expect(prepared.ok).toBe(true);
    if (!prepared.ok) {
      return;
    }

    expect(prepared.createBody?.productListingOrigin).toBe("own");

    const parsed = createProductBodySchema.safeParse(prepared.createBody);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.productListingOrigin).toBe("own");
    }
  });
});
