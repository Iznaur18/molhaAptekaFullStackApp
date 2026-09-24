import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import {
  getSetCookieHeader,
  startHttpTestServer,
  stopHttpTestServer,
} from "./helpers/httpTestApp.js";
import {
  completeRegistrationFlow,
  buildRegisterPayload,
  parseErrorMessage,
  parseSuccessData,
  setUserRole,
} from "./helpers/integrationTestHelpers.js";
import { AccountDeviceLinkModel, UserModel } from "../models/index.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";
import {
  LINKED_SESSIONS_MAX_ENTRIES,
  parseLinkedSessions,
  serializeLinkedSessions,
  upsertLinkedSession,
} from "../services/auth/linkedSessionsCodec.js";

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

/** Браузер в миниатюре: хранит cookie и стирает их по пустому значению. */
const createCookieJar = () => {
  /** @type {Map<string, string>} */
  const jar = new Map();
  return {
    /** @param {Headers} headers */
    absorb(headers) {
      for (const row of getSetCookieHeader(headers)) {
        const [pair] = row.split(";");
        const index = pair.indexOf("=");
        const name = pair.slice(0, index).trim();
        const value = pair.slice(index + 1).trim();
        if (!value || /expires=Thu, 01 Jan 1970/i.test(row)) {
          jar.delete(name);
        } else {
          jar.set(name, value);
        }
      }
    },
    header() {
      return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
    },
    has(name) {
      return jar.has(name);
    },
  };
};

/**
 * @param {ReturnType<typeof createCookieJar>} jar
 * @param {string} path
 * @param {{ method?: string; body?: unknown }} [init]
 */
const call = async (jar, path, { method = "GET", body } = {}) => {
  const response = await request(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(jar.header() ? { Cookie: jar.header() } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  jar.absorb(response.headers);
  return response;
};

/** Регистрирует пользователя; его сессия оседает в переданной «банке». */
const registerInto = async (jar, suffix) => {
  const payload = buildRegisterPayload(suffix);
  const { confirmResponse, session } = await completeRegistrationFlow(request, payload);
  jar.absorb(confirmResponse.headers);
  return { payload, userId: String(session._id) };
};

/** Регистрирует пользователя в отдельной «банке» — только ради логина/пароля. */
const registerElsewhere = async (suffix) => registerInto(createCookieJar(), suffix);

const login = async (jar, payload) => {
  const response = await call(jar, "/auth/login", {
    method: "POST",
    body: { email: payload.email, password: payload.password },
  });
  assert.equal(response.status, 200, await response.clone().text());
};

const listAccounts = async (jar) => {
  const response = await call(jar, "/auth/accounts");
  assert.equal(response.status, 200);
  return (await parseSuccessData(response)).accounts;
};

const meId = async (jar) => {
  const data = await parseSuccessData(await call(jar, "/auth/me"));
  return data.user ? String(data.user._id) : null;
};

/** Добавить аккаунт: отложить текущий и войти во второй. */
const addAccount = async (jar, payload) => {
  const stash = await call(jar, "/auth/accounts/stash", { method: "POST", body: {} });
  assert.equal(stash.status, 200, await stash.clone().text());
  await login(jar, payload);
};

test("codec: дубли, мусор и лимит отбрасываются", () => {
  const a = "a".repeat(24);
  const b = "b".repeat(24);
  const raw = `${a}:x.y.z,${a}:p.q.r,garbage,${b}:,zz:1.2.3,${"c".repeat(24)}:bad token`;
  assert.deepEqual(parseLinkedSessions(raw), [
    { userId: a, refreshToken: "x.y.z" },
    { userId: b, refreshToken: null },
  ]);

  let entries = [];
  for (let index = 0; index < 10; index += 1) {
    entries = upsertLinkedSession(entries, {
      userId: String(index).padStart(24, "0"),
      refreshToken: null,
    });
  }
  const roundTrip = parseLinkedSessions(serializeLinkedSessions(entries));
  assert.equal(roundTrip.length, LINKED_SESSIONS_MAX_ENTRIES);
  assert.equal(roundTrip[0].userId, "9".padStart(24, "0"), "свежий аккаунт первым");
});

test("добавление второго аккаунта и переключение туда-обратно без пароля", async () => {
  const jar = createCookieJar();
  const alice = await registerInto(jar, "alice");
  const bob = await registerElsewhere("bob");

  await addAccount(jar, bob.payload);
  assert.equal(await meId(jar), bob.userId);

  let accounts = await listAccounts(jar);
  assert.deepEqual(
    accounts.map((row) => [row.userId, row.isActive, row.requiresLogin]),
    [
      [bob.userId, true, false],
      [alice.userId, false, false],
    ],
  );

  const toAlice = await call(jar, "/auth/accounts/switch", {
    method: "POST",
    body: { userId: alice.userId },
  });
  assert.equal(toAlice.status, 200);
  assert.equal(await meId(jar), alice.userId);

  accounts = await listAccounts(jar);
  assert.deepEqual(
    accounts.map((row) => [row.userId, row.isActive]),
    [
      [alice.userId, true],
      [bob.userId, false],
    ],
  );

  const toBob = await call(jar, "/auth/accounts/switch", {
    method: "POST",
    body: { userId: bob.userId },
  });
  assert.equal(toBob.status, 200);
  assert.equal(await meId(jar), bob.userId);

  const link = await AccountDeviceLinkModel.findOne({}).lean();
  assert.ok(link, "связь аккаунтов записана для антифрода");
  assert.ok(link.seenCount >= 1);
});

test("stash не отзывает сессию: отложенный аккаунт жив и на сервере", async () => {
  const jar = createCookieJar();
  const alice = await registerInto(jar, "alice");
  const versionBefore = (
    await UserModel.findById(alice.userId).select("+authTokenVersion").lean()
  ).authTokenVersion;

  const stash = await call(jar, "/auth/accounts/stash", { method: "POST", body: {} });
  assert.equal(stash.status, 200);
  assert.equal(jar.has("refresh_token"), false, "активная сессия снята с браузера");
  assert.equal(await meId(jar), null);

  const versionAfter = (
    await UserModel.findById(alice.userId).select("+authTokenVersion").lean()
  ).authTokenVersion;
  assert.equal(versionAfter, versionBefore, "stash ≠ logout");

  // Отмена добавления: вернуться в отложенный аккаунт.
  const back = await call(jar, "/auth/accounts/switch", {
    method: "POST",
    body: { userId: alice.userId },
  });
  assert.equal(back.status, 200);
  assert.equal(await meId(jar), alice.userId);
});

test("отозванная на другом устройстве сессия требует входа", async () => {
  const jar = createCookieJar();
  const alice = await registerInto(jar, "alice");
  const bob = await registerElsewhere("bob");
  await addAccount(jar, bob.payload);

  // Alice вышла на другом устройстве → версия токенов выросла.
  await UserModel.findByIdAndUpdate(alice.userId, { $inc: { authTokenVersion: 1 } });

  const accounts = await listAccounts(jar);
  assert.equal(accounts.find((row) => row.userId === alice.userId).requiresLogin, true);

  const attempt = await call(jar, "/auth/accounts/switch", {
    method: "POST",
    body: { userId: alice.userId },
  });
  assert.equal(attempt.status, 409);
  assert.equal(
    await meId(jar),
    bob.userId,
    "неудачное переключение не рвёт текущую сессию",
  );

  // «Войти заново» = обычный добавочный вход: запись уходит из списка.
  await addAccount(jar, alice.payload);
  const after = await listAccounts(jar);
  assert.deepEqual(
    after.map((row) => [row.userId, row.isActive, row.requiresLogin]),
    [
      [alice.userId, true, false],
      [bob.userId, false, false],
    ],
  );
});

test("аккаунт персонала не переключается без пароля", async () => {
  const jar = createCookieJar();
  const moderator = await registerInto(jar, "moder");
  await setUserRole(moderator.userId, "moderator");
  const bob = await registerElsewhere("bob");

  await addAccount(jar, bob.payload);
  const accounts = await listAccounts(jar);
  assert.equal(
    accounts.find((row) => row.userId === moderator.userId).requiresLogin,
    true,
  );
  const attempt = await call(jar, "/auth/accounts/switch", {
    method: "POST",
    body: { userId: moderator.userId },
  });
  assert.equal(attempt.status, 409);
});

test("не больше 5 аккаунтов на браузер", async () => {
  const jar = createCookieJar();
  await registerInto(jar, "u0");
  for (let index = 1; index < 5; index += 1) {
    const other = await registerElsewhere(`u${index}`);
    await addAccount(jar, other.payload);
  }
  assert.equal((await listAccounts(jar)).length, 5);

  const overflow = await call(jar, "/auth/accounts/stash", {
    method: "POST",
    body: {},
  });
  assert.equal(overflow.status, 409);
  assert.match(await parseErrorMessage(overflow), /не больше 5/);
  assert.ok(await meId(jar), "при отказе текущая сессия остаётся");
});

test("убрать с устройства и выйти из всех", async () => {
  const jar = createCookieJar();
  const alice = await registerInto(jar, "alice");
  const bob = await registerElsewhere("bob");
  const carol = await registerElsewhere("carol");
  await addAccount(jar, bob.payload);
  await addAccount(jar, carol.payload);

  const remove = await call(jar, "/auth/accounts/remove", {
    method: "POST",
    body: { userId: bob.userId },
  });
  assert.equal(remove.status, 200);
  assert.equal((await parseSuccessData(remove)).removedActive, false);
  assert.deepEqual(
    (await listAccounts(jar)).map((row) => row.userId),
    [carol.userId, alice.userId],
  );
  const bobVersion = (
    await UserModel.findById(bob.userId).select("+authTokenVersion").lean()
  ).authTokenVersion;

  const logoutAll = await call(jar, "/auth/accounts/logout-all", {
    method: "POST",
    body: {},
  });
  assert.equal(logoutAll.status, 200);
  assert.equal((await parseSuccessData(logoutAll)).loggedOutCount, 2);
  assert.equal(await meId(jar), null);
  assert.deepEqual(await listAccounts(jar), []);

  const bobVersionAfter = (
    await UserModel.findById(bob.userId).select("+authTokenVersion").lean()
  ).authTokenVersion;
  assert.equal(bobVersionAfter, bobVersion, "убранный раньше аккаунт не трогаем");
});

test("switch на чужой/несохранённый аккаунт — 404, сессия цела", async () => {
  const jar = createCookieJar();
  const alice = await registerInto(jar, "alice");
  const stranger = await registerElsewhere("stranger");

  const attempt = await call(jar, "/auth/accounts/switch", {
    method: "POST",
    body: { userId: stranger.userId },
  });
  assert.equal(attempt.status, 404);
  assert.equal(await meId(jar), alice.userId);
});
