import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildStaffAuditEntry,
  isStaffAuditMutatingMethod,
} from "../services/audit/buildStaffAuditEntry.js";
import { STAFF_AUDIT_REDACTED_PLACEHOLDER } from "../constants/staffAuditConstants.js";

const baseInput = {
  method: "PATCH",
  action: "PATCH /product/:productId/moderation/approve",
  path: "/product/abc123/moderation/approve",
  params: { productId: "abc123" },
  body: { staffNote: "ок" },
  actorUserId: "actor-1",
  actorRole: "moderator",
  statusCode: 200,
  requestId: "req-1",
};

test("isStaffAuditMutatingMethod: только POST/PUT/PATCH/DELETE", () => {
  for (const m of ["POST", "put", "Patch", "DELETE"]) {
    assert.equal(isStaffAuditMutatingMethod(m), true);
  }
  for (const m of ["GET", "HEAD", "OPTIONS", "", undefined]) {
    assert.equal(isStaffAuditMutatingMethod(m), false);
  }
});

test("buildStaffAuditEntry: GET → null (чтения не пишем)", () => {
  const entry = buildStaffAuditEntry({ ...baseInput, method: "GET" });
  assert.equal(entry, null);
});

test("buildStaffAuditEntry: без актора → null", () => {
  const entry = buildStaffAuditEntry({ ...baseInput, actorUserId: null });
  assert.equal(entry, null);
});

test("buildStaffAuditEntry: собирает запись мутации", () => {
  const entry = buildStaffAuditEntry(baseInput);
  assert.ok(entry);
  assert.equal(entry.method, "PATCH");
  assert.equal(entry.action, baseInput.action);
  assert.equal(entry.path, baseInput.path);
  assert.equal(entry.actorUserId, "actor-1");
  assert.equal(entry.actorRole, "moderator");
  assert.equal(entry.statusCode, 200);
  assert.equal(entry.requestId, "req-1");
  assert.deepEqual(entry.params, { productId: "abc123" });
  assert.deepEqual(entry.requestBody, { staffNote: "ок" });
});

test("buildStaffAuditEntry: маскирует чувствительные ключи (в т.ч. вложенные)", () => {
  const entry = buildStaffAuditEntry({
    ...baseInput,
    body: {
      reason: "подделка",
      token: "secret-jwt",
      passport: { series: "1234", number: "567890" },
      nested: { authorizationHeader: "Bearer x" },
    },
  });
  assert.equal(entry.requestBody.reason, "подделка");
  assert.equal(entry.requestBody.token, STAFF_AUDIT_REDACTED_PLACEHOLDER);
  // `passport` целиком под маской — ключ содержит "passport"
  assert.equal(entry.requestBody.passport, STAFF_AUDIT_REDACTED_PLACEHOLDER);
  assert.equal(
    entry.requestBody.nested.authorizationHeader,
    STAFF_AUDIT_REDACTED_PLACEHOLDER,
  );
});

test("buildStaffAuditEntry: пустое тело → requestBody null", () => {
  assert.equal(buildStaffAuditEntry({ ...baseInput, body: {} }).requestBody, null);
  assert.equal(buildStaffAuditEntry({ ...baseInput, body: null }).requestBody, null);
});

test("buildStaffAuditEntry: большое тело обрезается", () => {
  const entry = buildStaffAuditEntry({
    ...baseInput,
    body: { note: "x".repeat(5000) },
  });
  assert.equal(entry.requestBody._truncated, true);
  assert.equal(typeof entry.requestBody.preview, "string");
  assert.ok(entry.requestBody.preview.length <= 2000);
});
