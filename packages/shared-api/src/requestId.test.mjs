import assert from "node:assert/strict";
import { test } from "node:test";

import {
  generateClientRequestId,
  getRequestIdFromAxiosError,
  isCorrelationWorthyApiFailure,
  normalizeClientRequestId,
  REQUEST_ID_HEADER,
} from "./requestId.ts";

test("generateClientRequestId: valid length and charset", () => {
  const id = generateClientRequestId();
  assert.equal(normalizeClientRequestId(id), id);
});

test("normalizeClientRequestId: rejects short/invalid", () => {
  assert.equal(normalizeClientRequestId("abc"), null);
  assert.equal(normalizeClientRequestId("bad id!"), null);
  assert.equal(normalizeClientRequestId("client-req-01"), "client-req-01");
});

test("isCorrelationWorthyApiFailure: 5xx and money/auth paths", () => {
  assert.equal(isCorrelationWorthyApiFailure("/product", 500), true);
  assert.equal(isCorrelationWorthyApiFailure("/product", 404), false);
  assert.equal(isCorrelationWorthyApiFailure("/auth/login", 401), true);
  assert.equal(isCorrelationWorthyApiFailure("/order", 400), true);
  assert.equal(
    isCorrelationWorthyApiFailure("/user/me/premium/purchase", 402),
    true,
  );
});

test("REQUEST_ID_HEADER constant", () => {
  assert.equal(REQUEST_ID_HEADER, "X-Request-Id");
});

test("getRequestIdFromAxiosError: reads attached requestId", () => {
  const id = "e2e-correlation-id-99";
  assert.equal(getRequestIdFromAxiosError({ requestId: id }), id);
  assert.equal(
    getRequestIdFromAxiosError({
      config: { _requestId: id, headers: {} },
    }),
    id,
  );
  assert.equal(
    getRequestIdFromAxiosError({
      response: { data: { requestId: id }, headers: {} },
    }),
    id,
  );
  assert.equal(
    getRequestIdFromAxiosError({
      config: { headers: { [REQUEST_ID_HEADER]: id } },
    }),
    id,
  );
});
