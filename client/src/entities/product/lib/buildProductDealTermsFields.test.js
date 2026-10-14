import { describe, expect, it } from "vitest";

import { buildProductDealTermsFields } from "./buildProductDealTermsFields.js";

describe("buildProductDealTermsFields", () => {
  it("у обычного товара полей нет, даже если в форме что-то осталось", () => {
    expect(
      buildProductDealTermsFields({
        categoryDealType: "goods",
        productServicePriceMode: "from",
        productViewingSchedule: "по выходным",
      }),
    ).toEqual({});
    expect(buildProductDealTermsFields({})).toEqual({});
  });

  it("услуга: вид цены, единица и места — с дефолтами для пустой формы", () => {
    expect(buildProductDealTermsFields({ categoryDealType: "service" })).toEqual({
      productServicePriceMode: "fixed",
      productServicePriceUnit: "service",
      productServiceLocations: [],
    });
    expect(
      buildProductDealTermsFields({
        categoryDealType: "service",
        productServicePriceMode: "from",
        productServicePriceUnit: "hour",
        productServiceLocations: ["online", "at_client"],
        productViewingSchedule: "не для услуги",
      }),
    ).toEqual({
      productServicePriceMode: "from",
      productServicePriceUnit: "hour",
      productServiceLocations: ["at_client", "online"],
    });
  });

  it("осмотр: своих полей нет", () => {
    expect(
      buildProductDealTermsFields({
        categoryDealType: "viewing",
        productServicePriceMode: "from",
      }),
    ).toEqual({});
  });
});
