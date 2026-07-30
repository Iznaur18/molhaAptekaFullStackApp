import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchProductInstallmentProgram = vi.fn();
const upsertProductInstallmentProgram = vi.fn();

vi.mock("../api/installmentApi.js", () => ({
  fetchProductInstallmentProgram: (...args) => fetchProductInstallmentProgram(...args),
  upsertProductInstallmentProgram: (...args) => upsertProductInstallmentProgram(...args),
}));

const { setProductInstallmentEnabled } = await import("./setProductInstallmentEnabled.js");

describe("setProductInstallmentEnabled", () => {
  beforeEach(() => {
    fetchProductInstallmentProgram.mockReset();
    upsertProductInstallmentProgram.mockReset();
  });

  it("returns needsSetup when enabling without plans", async () => {
    fetchProductInstallmentProgram.mockResolvedValue({ plans: [] });
    await expect(setProductInstallmentEnabled("p1", true)).resolves.toEqual({
      needsSetup: true,
    });
    expect(upsertProductInstallmentProgram).not.toHaveBeenCalled();
  });

  it("upserts isEnabled false with existing plans", async () => {
    fetchProductInstallmentProgram.mockResolvedValue({
      plans: [
        {
          title: "Стандарт",
          monthsCount: 3,
          monthlyAmountRub: 1000,
          firstPaymentRequiredNow: true,
        },
      ],
    });
    upsertProductInstallmentProgram.mockResolvedValue({});
    await expect(setProductInstallmentEnabled("p1", false)).resolves.toEqual({
      productInstallmentEnabled: false,
    });
    expect(upsertProductInstallmentProgram).toHaveBeenCalledWith("p1", {
      isEnabled: false,
      plans: [
        {
          title: "Стандарт",
          monthsCount: 3,
          monthlyAmountRub: 1000,
          firstPaymentRequiredNow: true,
        },
      ],
    });
  });

  it("short-circuits disable when no plans", async () => {
    fetchProductInstallmentProgram.mockResolvedValue({ plans: [] });
    await expect(setProductInstallmentEnabled("p1", false)).resolves.toEqual({
      productInstallmentEnabled: false,
    });
    expect(upsertProductInstallmentProgram).not.toHaveBeenCalled();
  });
});
