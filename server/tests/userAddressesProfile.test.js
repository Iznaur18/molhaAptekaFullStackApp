import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { UserModel } from "../models/index.js";
import {
  parseErrorMessage,
  parseSuccessData,
  registerUserAndGetCookie,
} from "./helpers/integrationTestHelpers.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
process.env.NODE_ENV = "test";

/** @type {import('node:http').Server | null} */
let server = null;
/** @type {(path: string, init?: RequestInit) => Promise<Response>} */
let request = async () => new Response();

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

test("PATCH userAddresses → GET roundtrip with two addresses", async () => {
  const { cookie, user } = await registerUserAndGetCookie(request, "addrbook");

  const patchBody = {
    userAddresses: [
      {
        id: "home-1",
        label: "Дом",
        line: "Москва, Тверская улица, д 1",
        flat: "",
        isDefault: true,
      },
      {
        id: "work-2",
        label: "Работа",
        line: "Москва, Арбат, д 2",
        flat: "12",
        isDefault: false,
      },
    ],
  };

  const patchResponse = await request(`/user/${user._id}`, {
    method: "PATCH",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patchBody),
  });
  assert.equal(patchResponse.status, 200);
  const patched = await parseSuccessData(patchResponse);
  assert.equal(Array.isArray(patched.user.userAddresses), true);
  assert.equal(patched.user.userAddresses.length, 2);
  assert.equal(patched.user.userAddress, "Москва, Тверская улица, д 1");

  const getResponse = await request(`/user/${user._id}`, {
    headers: { Cookie: cookie },
  });
  assert.equal(getResponse.status, 200);

  const profile = await parseSuccessData(getResponse);
  assert.equal(profile.user.userAddresses.length, 2);
  assert.equal(profile.user.userAddressFlat, "");
  assert.equal(profile.user.userAddresses.find((item) => item.isDefault)?.id, "home-1");

  const stored = await UserModel.findById(user._id).lean();
  assert.equal(stored?.userAddresses?.length, 2);
  assert.equal(stored?.userAddress, patched.user.userAddress);
});

test("PATCH rejects userAddress and userAddresses together", async () => {
  const { cookie, user } = await registerUserAndGetCookie(request, "addrconflict");

  const response = await request(`/user/${user._id}`, {
    method: "PATCH",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userAddress: "Москва, Тверская 1",
      userAddresses: [
        {
          id: "home-1",
          line: "Москва, Тверская 1",
          flat: "",
          isDefault: true,
        },
      ],
    }),
  });

  assert.equal(response.status, 400);
  const message = await parseErrorMessage(response);
  assert.match(message, /userAddress и userAddresses/u);
});
