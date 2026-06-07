import { afterEach, describe, expect, it, vi } from "vitest";

const loadValidator = async (requireSuggest) => {
  vi.resetModules();
  vi.doMock("../../../shared/config/featureFlags.js", () => ({
    IS_REQUIRE_ADDRESS_FROM_DADATA_SUGGEST_ENABLED: requireSuggest,
  }));
  const { validateRuDeliveryAddressForm } = await import("./validateRuDeliveryAddressForm.js");
  return validateRuDeliveryAddressForm;
};

describe("validateRuDeliveryAddressForm", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("../../../shared/config/featureFlags.js");
  });

  it("returns null for empty line when not required", async () => {
    const validate = await loadValidator(false);
    expect(validate({ line: "  ", selectedFromSuggest: false })).toBeNull();
  });

  it("requires non-empty line when required", async () => {
    const validate = await loadValidator(false);
    expect(validate({ line: "", selectedFromSuggest: false }, { required: true })).toBe(
      "Укажите адрес доставки",
    );
  });

  it("does not throw ReferenceError when line is filled (regression)", async () => {
    const validate = await loadValidator(false);
    expect(() =>
      validate({ line: "Москва, ул. Ленина 1", selectedFromSuggest: false }, { required: true }),
    ).not.toThrow();
    expect(
      validate({ line: "Москва, ул. Ленина 1", selectedFromSuggest: false }, { required: true }),
    ).toBeNull();
  });

  it("requires DaData pick when feature flag is on", async () => {
    const validate = await loadValidator(true);
    expect(
      validate({ line: "Москва, ул. Ленина 1", selectedFromSuggest: false }, { required: true }),
    ).toBe("Выберите адрес из списка подсказок");
    expect(
      validate({ line: "Москва, ул. Ленина 1", selectedFromSuggest: true }, { required: true }),
    ).toBeNull();
  });

  it("rejects line longer than max length", async () => {
    const validate = await loadValidator(false);
    const longLine = "а".repeat(101);
    expect(validate({ line: longLine, selectedFromSuggest: true })).toMatch(/не длиннее/);
  });
});
