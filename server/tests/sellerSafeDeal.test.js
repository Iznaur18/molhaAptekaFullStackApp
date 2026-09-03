import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { UserModel, UserInAppNotificationModel } = await import("../models/index.js");
const {
  getMySellerSafeDeal,
  listSellerSafeDealApplications,
  reviewSellerSafeDealApplication,
  submitSellerSafeDealApplication,
} = await import("../services/seller/sellerSafeDeal.js");

/** ИНН организации — 10 цифр, ИНН ИП — 12; оба с верной контрольной суммой. */
const INN_OOO = "2368017598";
const INN_IP = "500100732259";

/** @param {{ role?: string }} [options] */
async function makeUser({ role = "user" } = {}) {
  return UserModel.create({
    userName: `seller-${Math.random().toString(36).slice(2, 10)}`,
    email: `${Math.random().toString(36).slice(2, 10)}@example.com`,
    passwordHash: "x".repeat(60),
    userRole: role,
  });
}

describe("заявка на безопасную сделку", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("новый продавец безопасную сделку не подключал", async () => {
    const user = await makeUser();

    const safeDeal = await getMySellerSafeDeal(String(user._id));

    assert.equal(safeDeal.moderationStatus, "none");
    assert.equal(safeDeal.legalForm, "");
    assert.equal(safeDeal.inn, "");
    assert.equal(safeDeal.isApproved, false);
  });

  it("подача заявки переводит её в ожидание", async () => {
    const user = await makeUser();

    const safeDeal = await submitSellerSafeDealApplication({
      userId: String(user._id),
      legalForm: "ooo",
      inn: INN_OOO,
    });

    assert.equal(safeDeal.moderationStatus, "pending");
    assert.equal(safeDeal.legalForm, "ooo");
    assert.equal(safeDeal.inn, INN_OOO);
    assert.ok(safeDeal.submittedAt, "дата подачи проставлена");
    assert.equal(safeDeal.isApproved, false, "до решения модератора значка нет");
  });

  it("ИНН с битой контрольной суммой не проходит и мимо валидации тела", async () => {
    const user = await makeUser();

    await assert.rejects(
      () =>
        submitSellerSafeDealApplication({
          userId: String(user._id),
          legalForm: "ooo",
          inn: "2368017597",
        }),
      /с ошибкой/i,
    );
  });

  it("ИНН чужой длины к выбранной форме не подходит", async () => {
    const user = await makeUser();

    await assert.rejects(
      () =>
        submitSellerSafeDealApplication({
          userId: String(user._id),
          legalForm: "ip",
          inn: INN_OOO,
        }),
      /с ошибкой/i,
    );
  });

  it("повторная подача поверх ожидающей отклоняется", async () => {
    const user = await makeUser();
    await submitSellerSafeDealApplication({
      userId: String(user._id),
      legalForm: "ooo",
      inn: INN_OOO,
    });

    await assert.rejects(
      () =>
        submitSellerSafeDealApplication({
          userId: String(user._id),
          legalForm: "ooo",
          inn: INN_OOO,
        }),
      /на рассмотрении/i,
    );
  });

  it("одобрение включает значок и шлёт уведомление", async () => {
    const user = await makeUser();
    const moderator = await makeUser({ role: "moderator" });
    await submitSellerSafeDealApplication({
      userId: String(user._id),
      legalForm: "ip",
      inn: INN_IP,
    });

    const safeDeal = await reviewSellerSafeDealApplication({
      userId: String(user._id),
      moderatorId: String(moderator._id),
      nextStatus: "approved",
    });

    assert.equal(safeDeal.moderationStatus, "approved");
    assert.equal(safeDeal.isApproved, true);
    assert.ok(safeDeal.reviewedAt, "дата решения проставлена");

    const notifications = await UserInAppNotificationModel.find({
      userId: user._id,
      kind: "safe_deal_moderation",
    }).lean();
    assert.equal(notifications.length, 1, "продавцу ушло уведомление о решении");
  });

  it("отказ сохраняет причину и допускает переподачу", async () => {
    const user = await makeUser();
    const moderator = await makeUser({ role: "moderator" });
    await submitSellerSafeDealApplication({
      userId: String(user._id),
      legalForm: "ooo",
      inn: INN_OOO,
    });

    const rejected = await reviewSellerSafeDealApplication({
      userId: String(user._id),
      moderatorId: String(moderator._id),
      nextStatus: "rejected",
      comment: "ИНН не совпадает с выпиской ЕГРЮЛ",
    });
    assert.equal(rejected.moderationStatus, "rejected");
    assert.match(rejected.moderationComment, /ЕГРЮЛ/);

    const resubmitted = await submitSellerSafeDealApplication({
      userId: String(user._id),
      legalForm: "ip",
      inn: INN_IP,
    });
    assert.equal(resubmitted.moderationStatus, "pending");
    assert.equal(resubmitted.moderationComment, "", "старое решение сброшено");
    assert.equal(resubmitted.reviewedAt, null);
  });

  it("подключённый продавец не меняет ИНН формой", async () => {
    const user = await makeUser();
    const moderator = await makeUser({ role: "moderator" });
    await submitSellerSafeDealApplication({
      userId: String(user._id),
      legalForm: "ooo",
      inn: INN_OOO,
    });
    await reviewSellerSafeDealApplication({
      userId: String(user._id),
      moderatorId: String(moderator._id),
      nextStatus: "approved",
    });

    await assert.rejects(
      () =>
        submitSellerSafeDealApplication({
          userId: String(user._id),
          legalForm: "ip",
          inn: INN_IP,
        }),
      /уже подключена/i,
    );
  });

  it("один ИНН нельзя подтвердить двум продавцам", async () => {
    const first = await makeUser();
    const second = await makeUser();
    const moderator = await makeUser({ role: "moderator" });

    await submitSellerSafeDealApplication({
      userId: String(first._id),
      legalForm: "ooo",
      inn: INN_OOO,
    });
    await reviewSellerSafeDealApplication({
      userId: String(first._id),
      moderatorId: String(moderator._id),
      nextStatus: "approved",
    });

    await assert.rejects(
      () =>
        submitSellerSafeDealApplication({
          userId: String(second._id),
          legalForm: "ooo",
          inn: INN_OOO,
        }),
      /уже подтверждён/i,
    );
  });

  it("решение по неподанной заявке невозможно", async () => {
    const user = await makeUser();
    const moderator = await makeUser({ role: "moderator" });

    await assert.rejects(
      () =>
        reviewSellerSafeDealApplication({
          userId: String(user._id),
          moderatorId: String(moderator._id),
          nextStatus: "approved",
        }),
      /не подавал заявку/i,
    );
  });

  it("очередь модерации отдаёт только заявки нужного статуса", async () => {
    const pendingUser = await makeUser();
    const approvedUser = await makeUser();
    const moderator = await makeUser({ role: "moderator" });

    await submitSellerSafeDealApplication({
      userId: String(pendingUser._id),
      legalForm: "ooo",
      inn: INN_OOO,
    });
    await submitSellerSafeDealApplication({
      userId: String(approvedUser._id),
      legalForm: "ip",
      inn: INN_IP,
    });
    await reviewSellerSafeDealApplication({
      userId: String(approvedUser._id),
      moderatorId: String(moderator._id),
      nextStatus: "approved",
    });

    const queue = await listSellerSafeDealApplications({ status: "pending" });

    assert.equal(queue.total, 1);
    assert.equal(queue.applications[0].userId, String(pendingUser._id));
    assert.equal(queue.applications[0].inn, INN_OOO);
  });
});
