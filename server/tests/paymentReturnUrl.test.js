import assert from "node:assert/strict";
import test from "node:test";

import {
  appendPaymentIdToReturnPath,
  buildReturnUrl,
} from "../services/payments/paymentReturnUrl.js";

test("appendPaymentIdToReturnPath keeps existing query", () => {
  assert.equal(
    appendPaymentIdToReturnPath("/user-list?donated=1", "abc123"),
    "/user-list?donated=1&paymentId=abc123",
  );
});

test("appendPaymentIdToReturnPath adds query when absent", () => {
  assert.equal(
    appendPaymentIdToReturnPath("/user-list", "abc123"),
    "/user-list?paymentId=abc123",
  );
});

test("buildReturnUrl uses first FRONTEND_URL origin", () => {
  const prev = process.env.FRONTEND_URL;
  process.env.FRONTEND_URL = "http://localhost:5173,https://example.com";
  try {
    assert.equal(
      buildReturnUrl("/user-list?donated=1&paymentId=x"),
      "http://localhost:5173/user-list?donated=1&paymentId=x",
    );
  } finally {
    process.env.FRONTEND_URL = prev;
  }
});
