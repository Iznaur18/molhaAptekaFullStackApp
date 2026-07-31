import assert from "node:assert/strict";
import test from "node:test";

import {
  PRODUCT_SELLER_PUBLIC_FIELD_NAMES,
  PRODUCT_SELLER_PUBLIC_SELECT,
} from "../constants/productSellerPublicFields.js";
import { pickProductSellerPublicSnapshot } from "../services/product/attachProductSellerSnapshots.js";

const CONTACT_FIELDS = ["email", "userPhoneNumber", "userAddress"];

test("PRODUCT_SELLER_PUBLIC_FIELD_NAMES excludes seller contact PII", () => {
  for (const field of CONTACT_FIELDS) {
    assert.equal(
      PRODUCT_SELLER_PUBLIC_FIELD_NAMES.includes(field),
      false,
      `public seller fields must not include ${field}`,
    );
  }
  assert.ok(PRODUCT_SELLER_PUBLIC_FIELD_NAMES.includes("_id"));
  assert.ok(PRODUCT_SELLER_PUBLIC_FIELD_NAMES.includes("userName"));
  assert.equal(
    PRODUCT_SELLER_PUBLIC_SELECT.includes("email"),
    false,
  );
});

test("pickProductSellerPublicSnapshot drops contact fields even if present on seller", () => {
  const snapshot = pickProductSellerPublicSnapshot({
    _id: "aaaaaaaaaaaaaaaaaaaaaaaa",
    userName: "seller_one",
    email: "leak@example.com",
    userPhoneNumber: "+79001234567",
    userAddress: "secret street 1",
    userAvatarUrl: "/uploads/a.jpg",
    isPremiumUser: true,
    isUserDataConfirmed: true,
    totalSalesAmount: 12,
    followersCount: 3,
  });

  assert.ok(snapshot);
  assert.equal(snapshot.userName, "seller_one");
  assert.equal(snapshot.email, undefined);
  assert.equal(snapshot.userPhoneNumber, undefined);
  assert.equal(snapshot.userAddress, undefined);
  assert.equal(snapshot.isPremiumUser, true);
  assert.equal(snapshot.followersCount, 3);
});
