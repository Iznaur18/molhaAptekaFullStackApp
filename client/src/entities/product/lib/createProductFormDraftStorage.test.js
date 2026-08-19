import { beforeEach, describe, expect, it } from "vitest";

import { CREATE_PRODUCT_INITIAL_FORM } from "./createProductFormState.js";
import {
  clearCreateProductFormDraft,
  isCreateProductFormDraftMeaningful,
  persistCreateProductFormDraft,
  readCreateProductFormDraft,
} from "./createProductFormDraftStorage.js";

describe("createProductFormDraftStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("treats a freshly opened (only pickup-seeded) form as empty", () => {
    expect(
      isCreateProductFormDraftMeaningful({
        ...CREATE_PRODUCT_INITIAL_FORM,
        productPickupAddress: "Москва, ул. Пушкина 1",
        productRegionCode: "RU-MOW",
      }),
    ).toBe(false);
  });

  it("treats entered name/photo/price as meaningful", () => {
    expect(
      isCreateProductFormDraftMeaningful({ ...CREATE_PRODUCT_INITIAL_FORM, productName: "iPhone" }),
    ).toBe(true);
    expect(
      isCreateProductFormDraftMeaningful({
        ...CREATE_PRODUCT_INITIAL_FORM,
        productImageRows: [{ id: "a", url: "/uploads/1.webp" }],
      }),
    ).toBe(true);
  });

  it("round-trips a meaningful draft with its step", () => {
    persistCreateProductFormDraft({
      form: { ...CREATE_PRODUCT_INITIAL_FORM, productName: "Товар", productPrice: "1 000" },
      stepIndex: 3,
    });

    const draft = readCreateProductFormDraft();
    expect(draft?.form.productName).toBe("Товар");
    expect(draft?.form.productPrice).toBe("1 000");
    expect(draft?.stepIndex).toBe(3);
    // merged over defaults so a later schema field still resolves
    expect(draft?.form.productIsAvailable).toBe(true);
    expect(Array.isArray(draft?.form.productImageRows)).toBe(true);
  });

  it("never writes an empty form", () => {
    persistCreateProductFormDraft({ form: { ...CREATE_PRODUCT_INITIAL_FORM }, stepIndex: 0 });
    expect(readCreateProductFormDraft()).toBeNull();
  });

  it("keeps a prior draft when a later empty form is persisted (hydration guard)", () => {
    persistCreateProductFormDraft({
      form: { ...CREATE_PRODUCT_INITIAL_FORM, productName: "Товар" },
      stepIndex: 1,
    });
    // First render after reopen sees the not-yet-hydrated empty form.
    persistCreateProductFormDraft({ form: { ...CREATE_PRODUCT_INITIAL_FORM }, stepIndex: 0 });
    expect(readCreateProductFormDraft()?.form.productName).toBe("Товар");
  });

  it("clears the draft explicitly", () => {
    persistCreateProductFormDraft({
      form: { ...CREATE_PRODUCT_INITIAL_FORM, productName: "Товар" },
      stepIndex: 2,
    });
    clearCreateProductFormDraft();
    expect(readCreateProductFormDraft()).toBeNull();
  });
});
