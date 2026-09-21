import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

process.env.JWT_SECRET ||= "test-secret-for-user-email";

const { UserModel } = await import("../models/index.js");
const { getUserEmailController } =
  await import("../controllers/User/getUserEmailController.js");

/** @param {Record<string, unknown> | null} user */
function mockUser(user) {
  mock.method(UserModel, "findById", () => ({
    select: () => ({ lean: async () => user }),
  }));
}

function callController() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return getUserEmailController(
    { params: { userIdClient: "64b000000000000000000001" } },
    res,
  ).then(() => res);
}

describe("GET /user/:id/email", () => {
  afterEach(() => mock.restoreAll());

  it("отдаёт почту зарегистрированного по почте", async () => {
    mockUser({ email: "seller@mail.ru", isBlockedUser: false });
    const res = await callController();
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.email, "seller@mail.ru");
  });

  it("без почты — 404", async () => {
    mockUser({ email: "", isBlockedUser: false });
    const res = await callController();
    assert.equal(res.statusCode, 404);
  });

  it("заблокированного не показываем", async () => {
    mockUser({ email: "x@mail.ru", isBlockedUser: true });
    const res = await callController();
    assert.equal(res.statusCode, 404);
  });
});
