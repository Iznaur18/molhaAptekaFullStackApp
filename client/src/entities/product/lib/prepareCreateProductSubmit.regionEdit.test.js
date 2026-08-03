import { patchMyProductBodySchema } from "@molha/api-contract";
import { describe, expect, it } from "vitest";

import { CREATE_PRODUCT_INITIAL_FORM } from "../../../entities/product/lib/createProductFormState.js";
import { prepareCreateProductSubmit } from "../../../entities/product/lib/prepareCreateProductSubmit.js";

const sellerContext = {
  sellerPointsMaxPerUnit: 100,
  sellerCatalogCommitted: 0,
};

const editForm = {
  ...CREATE_PRODUCT_INITIAL_FORM,
  productName: "Товар для правки региона",
  productListingOrigin: "own",
  productIsOriginal: true,
  productDescription: "Описание товара достаточной длины для проверки.",
  productPrice: "1500",
  productStockQuantity: "2",
  productImageRows: [{ id: "1", url: "https://cdn.example.com/product.jpg" }],
  productCategory: "home_garden",
  productCategoryId: "507f1f77bcf86cd799439011",
  productRegionCode: "RU-CE",
  productPickupAddress: "Чебоксары, ул Ленина, д 1",
  productPickupLat: 56.14,
  productPickupLon: 47.25,
  productReturnEnabled: false,
};

describe("prepareCreateProductSubmit region edit", () => {
  it("builds patchBody with region + categoryId that passes contract", () => {
    const prepared = prepareCreateProductSubmit({
      form: editForm,
      isEdit: true,
      showCatalogAvailabilityToggle: true,
      ...sellerContext,
    });

    expect(prepared.ok).toBe(true);
    if (!prepared.ok) {
      return;
    }

    expect(prepared.patchBody?.productRegionCode).toBe("RU-CE");
    expect(prepared.patchBody?.productCategoryId).toBe("507f1f77bcf86cd799439011");
    expect(prepared.patchBody?.productCategory).toBeUndefined();

    const parsed = patchMyProductBodySchema.safeParse(prepared.patchBody);
    expect(parsed.success).toBe(true);
  });

  it("requires productCategoryId", () => {
    const prepared = prepareCreateProductSubmit({
      form: {
        ...editForm,
        productCategoryId: null,
        productCategory: "home_garden",
      },
      isEdit: true,
      showCatalogAvailabilityToggle: true,
      ...sellerContext,
    });

    expect(prepared.ok).toBe(false);
  });
});
