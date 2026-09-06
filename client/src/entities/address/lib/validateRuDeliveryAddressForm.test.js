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
    // Длину берём из константы, а не числом: она уже росла со 100 до 200 ради
    // адресов, которые DaData отдаёт длиннее сотни, и зашитое здесь число молча
    // превращало тест в проверку валидного адреса.
    const { ADDRESS_LINE_MAX_LENGTH } = await import("../model/constants.js");
    const longLine = "а".repeat(ADDRESS_LINE_MAX_LENGTH + 1);
    expect(validate({ line: longLine, selectedFromSuggest: true })).toMatch(/не длиннее/);
  });

  it("accepts a real address that used to be too long", async () => {
    const validate = await loadValidator(false);
    // 102 символа: три таких варианта DaData отдаёт по одному посёлку в ХМАО,
    // и на прежнем лимите заказать оттуда было нельзя вовсе.
    const line =
      "Ханты-Мансийский Автономный округ - Югра, Кондинский р-н, пгт Междуреченский, ул Волгоградская, уч 12а";
    expect(validate({ line, selectedFromSuggest: true })).toBeNull();
  });
});
