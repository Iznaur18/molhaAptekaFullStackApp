import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PRODUCT_SELLER_PUBLIC_FIELD_NAMES } from "../constants/productSellerPublicFields.js";
import { pickProductSellerPublicSnapshot } from "../services/product/attachProductSellerSnapshots.js";

/**
 * Снимок продавца собирается по списку публичных полей. Вложенные пути в этом
 * списке (`sellerSafeDeal.moderationStatus`) читаются из документа как объект,
 * а не как ключ с точкой — на этом значок безопасной сделки уже один раз молча
 * не доехал до витрины.
 */
describe("снимок продавца для витрины", () => {
  it("отдаёт статус безопасной сделки вложенным объектом", () => {
    const snapshot = pickProductSellerPublicSnapshot({
      _id: "seller-1",
      userName: "shop",
      sellerSafeDeal: { moderationStatus: "approved" },
    });

    assert.deepEqual(snapshot.sellerSafeDeal, { moderationStatus: "approved" });
  });

  it("не выдумывает поле, когда продавец заявку не подавал", () => {
    const snapshot = pickProductSellerPublicSnapshot({
      _id: "seller-1",
      userName: "shop",
    });

    assert.equal(snapshot.sellerSafeDeal, undefined);
  });

  it("не отдаёт наружу ИНН и комментарий модератора", () => {
    const snapshot = pickProductSellerPublicSnapshot({
      _id: "seller-1",
      userName: "shop",
      sellerSafeDeal: {
        moderationStatus: "approved",
        inn: "2368017598",
        legalForm: "ooo",
        moderationComment: "внутренняя заметка",
      },
    });

    assert.deepEqual(Object.keys(snapshot.sellerSafeDeal), ["moderationStatus"]);
  });

  it("плоские поля из списка не теряются", () => {
    const snapshot = pickProductSellerPublicSnapshot({
      _id: "seller-1",
      userName: "shop",
      isPremiumUser: true,
      isUserDataConfirmed: true,
      email: "secret@example.com",
    });

    assert.equal(snapshot.userName, "shop");
    assert.equal(snapshot.isPremiumUser, true);
    assert.equal(snapshot.email, undefined, "непубличные поля не копируются");
  });

  it("список публичных полей не содержит ИНН ни в каком виде", () => {
    for (const field of PRODUCT_SELLER_PUBLIC_FIELD_NAMES) {
      assert.ok(!/inn/i.test(field), `поле ${field} не должно быть публичным`);
    }
  });
});
