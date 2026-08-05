import { beforeEach, describe, expect, it } from "vitest";

import {
  clearAllDataConfirmationFormDrafts,
  clearDataConfirmationFormDraft,
  persistDataConfirmationFormDraft,
  readDataConfirmationFormDraft,
} from "./dataConfirmationFormDraftStorage.js";
import { PASSPORT_FORM_STEP_PASSPORT } from "./validatePassportFormStep.js";

describe("dataConfirmationFormDraftStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips form + step per userId", () => {
    persistDataConfirmationFormDraft("user-a", {
      form: {
        lastName: "Иванов",
        firstName: "Иван",
        middleName: "Иванович",
        birthDate: "01.01.1990",
        series: "1234",
        number: "567890",
        issuedBy: "ОВД",
        issuedAt: "02.02.2010",
        departmentCode: "123-456",
      },
      step: PASSPORT_FORM_STEP_PASSPORT,
    });

    const draft = readDataConfirmationFormDraft("user-a");
    expect(draft?.form.lastName).toBe("Иванов");
    expect(draft?.form.departmentCode).toBe("123-456");
    expect(draft?.step).toBe(PASSPORT_FORM_STEP_PASSPORT);
    expect(readDataConfirmationFormDraft("user-b")).toBeNull();

    clearDataConfirmationFormDraft("user-a");
    expect(readDataConfirmationFormDraft("user-a")).toBeNull();
  });

  it("clamps invalid step and coerces form fields", () => {
    persistDataConfirmationFormDraft("user-a", {
      form: /** @type {any} */ ({ lastName: 1, firstName: null }),
      step: 99,
    });

    const draft = readDataConfirmationFormDraft("user-a");
    expect(draft?.form.lastName).toBe("");
    expect(draft?.form.firstName).toBe("");
    expect(draft?.step).toBe(0);
  });

  it("clearAll removes only draft keys", () => {
    localStorage.setItem("other", "1");
    persistDataConfirmationFormDraft("user-a", {
      form: {
        lastName: "A",
        firstName: "B",
        middleName: "",
        birthDate: "",
        series: "",
        number: "",
        issuedBy: "",
        issuedAt: "",
        departmentCode: "",
      },
      step: 0,
    });
    persistDataConfirmationFormDraft("user-b", {
      form: {
        lastName: "C",
        firstName: "D",
        middleName: "",
        birthDate: "",
        series: "",
        number: "",
        issuedBy: "",
        issuedAt: "",
        departmentCode: "",
      },
      step: 1,
    });

    clearAllDataConfirmationFormDrafts();
    expect(readDataConfirmationFormDraft("user-a")).toBeNull();
    expect(readDataConfirmationFormDraft("user-b")).toBeNull();
    expect(localStorage.getItem("other")).toBe("1");
  });
});
