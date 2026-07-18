import { describe, expect, it } from "vitest";

import { getUserProfileRows } from "./getUserProfileRows.js";
import { RU_PHONE_EMPTY_LABEL } from "./ruPhone.js";

describe("getUserProfileRows phone", () => {
  it("форматирует E.164 и даёт tel: href", () => {
    const rows = getUserProfileRows({
      userName: "tester",
      userPhoneNumber: "+79123456789",
    });
    const phone = rows.find((row) => row.id === "userPhoneNumber");
    expect(phone?.value).toBe("8 (912) 345-67-89");
    expect(phone?.href).toBe("tel:+79123456789");
  });

  it("пустое значение — «не указан» без href", () => {
    const rows = getUserProfileRows({ userName: "tester" });
    const phone = rows.find((row) => row.id === "userPhoneNumber");
    expect(phone?.value).toBe(RU_PHONE_EMPTY_LABEL);
    expect(phone?.href).toBeUndefined();
  });
});
