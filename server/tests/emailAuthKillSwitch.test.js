import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { EMAIL_AUTH_DISABLED_MESSAGE } from "@izibuy/shared-lib";

import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import { parseErrorMessage } from "./helpers/integrationTestHelpers.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "email-auth-kill-switch-jwt-secret-min-32";
process.env.NODE_ENV = "test";

/** @type {import('node:http').Server | null} */
let server = null;
/** @type {(path: string, init?: RequestInit) => Promise<Response>} */
let request = async () => new Response();

const postJson = (path, body) =>
  request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const withEmailAuthDisabled = async (run) => {
  const previous = process.env.EMAIL_AUTH_ENABLED;
  process.env.EMAIL_AUTH_ENABLED = "false";
  try {
    await run();
  } finally {
    if (previous === undefined) {
      delete process.env.EMAIL_AUTH_ENABLED;
    } else {
      process.env.EMAIL_AUTH_ENABLED = previous;
    }
  }
};

before(async () => {
  await connectMongoTestReplSet();
  const testServer = await startHttpTestServer();
  server = testServer.server;
  request = testServer.request;
});

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  if (server) {
    await stopHttpTestServer(server);
  }
  await disconnectMongoTestReplSet();
});

test("email auth kill switch: login/register/reset по почте отдают 503", async () => {
  await withEmailAuthDisabled(async () => {
    const register = await postJson("/auth/register", {
      email: "blocked-register@example.com",
      password: "secret12",
      passwordConfirm: "secret12",
      userName: "blockedregister",
    });
    assert.equal(register.status, 503);
    assert.equal(await parseErrorMessage(register), EMAIL_AUTH_DISABLED_MESSAGE);

    const login = await postJson("/auth/login", {
      email: "blocked-login@example.com",
      password: "secret12",
    });
    assert.equal(login.status, 503);
    assert.equal(await parseErrorMessage(login), EMAIL_AUTH_DISABLED_MESSAGE);

    const resetRequest = await postJson("/auth/password/reset/request", {
      email: "blocked-reset@example.com",
    });
    assert.equal(resetRequest.status, 503);
    assert.equal(await parseErrorMessage(resetRequest), EMAIL_AUTH_DISABLED_MESSAGE);

    const resetConfirm = await postJson("/auth/password/reset/confirm", {
      email: "blocked-reset@example.com",
      code: "123456",
      newPassword: "secret99",
      newPasswordConfirm: "secret99",
    });
    assert.equal(resetConfirm.status, 503);
    assert.equal(await parseErrorMessage(resetConfirm), EMAIL_AUTH_DISABLED_MESSAGE);
  });
});
