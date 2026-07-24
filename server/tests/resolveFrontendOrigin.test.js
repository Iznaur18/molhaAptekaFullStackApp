import assert from "node:assert/strict";
import test from "node:test";

import {
  parseFrontendOrigins,
  resolveFrontendOrigin,
} from "../utils/resolveFrontendOrigin.js";

test("parseFrontendOrigins: splits comma list", () => {
  assert.deepEqual(
    parseFrontendOrigins(
      "http://127.0.0.1:5173, http://localhost:8081, http://localhost:19006/",
    ),
    [
      "http://127.0.0.1:5173",
      "http://localhost:8081",
      "http://localhost:19006",
    ],
  );
});

test("resolveFrontendOrigin: first origin only", () => {
  assert.equal(
    resolveFrontendOrigin(
      "http://127.0.0.1:5173,http://localhost:8081,http://localhost:19006",
    ),
    "http://127.0.0.1:5173",
  );
});

test("resolveFrontendOrigin: default when empty", () => {
  assert.equal(resolveFrontendOrigin(""), "http://127.0.0.1:5173");
});
