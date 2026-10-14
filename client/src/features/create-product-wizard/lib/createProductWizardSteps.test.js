import { describe, expect, it } from "vitest";

import {
  CREATE_PRODUCT_WIZARD_STEP_IDS,
  resolveProductWizardStepIds,
} from "./createProductWizardSteps.js";

describe("resolveProductWizardStepIds", () => {
  it("goods and unknown types keep every step", () => {
    expect(resolveProductWizardStepIds("goods")).toEqual(
      CREATE_PRODUCT_WIZARD_STEP_IDS,
    );
    expect(resolveProductWizardStepIds("")).toEqual(CREATE_PRODUCT_WIZARD_STEP_IDS);
  });

  it("viewing and service have no listing origin step", () => {
    for (const dealType of ["viewing", "service"]) {
      const stepIds = resolveProductWizardStepIds(dealType);
      expect(stepIds).not.toContain("originality");
      expect(stepIds).toHaveLength(CREATE_PRODUCT_WIZARD_STEP_IDS.length - 1);
      expect(stepIds.at(-1)).toBe("review");
    }
  });
});
