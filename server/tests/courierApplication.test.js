import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { UserModel, UserInAppNotificationModel } = await import("../models/index.js");
const {
  getMyCourierProfile,
  listCourierApplications,
  reviewCourierApplication,
  submitCourierApplication,
} = await import("../services/courier/courierApplication.js");

const VEHICLE = {
  vehicleMake: "Lada Granta",
  vehicleColor: "белый",
  vehiclePlate: "х123ум797",
};

/** @param {{ withAddress?: boolean; role?: string }} [options] */
async function makeUser({ withAddress = true, role = "user" } = {}) {
  return UserModel.create({
    userName: `courier-${Math.random().toString(36).slice(2, 10)}`,
    email: `${Math.random().toString(36).slice(2, 10)}@example.com`,
    passwordHash: "x".repeat(60),
    userRole: role,
    ...(withAddress
      ? { userAddress: "г Москва, ул Зеленоградская, д 23А", userRegionCode: "RU-MOW" }
      : {}),
  });
}

describe("заявка курьера", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("новый пользователь курьером не является", async () => {
    const user = await makeUser();

    const profile = await getMyCourierProfile(String(user._id));

    assert.equal(profile.moderationStatus, "none");
    assert.equal(profile.isApproved, false);
  });

  it("подача заявки переводит её в ожидание", async () => {
    const user = await makeUser();

    const profile = await submitCourierApplication({
      userId: String(user._id),
      ...VEHICLE,
    });

    assert.equal(profile.moderationStatus, "pending");
    assert.equal(profile.vehiclePlate, "х123ум797");
    assert.ok(profile.submittedAt, "дата подачи проставлена");
    assert.equal(profile.isApproved, false, "до решения модератора заказы брать нельзя");
  });

  it("без адреса в профиле заявку не принять", async () => {
    const user = await makeUser({ withAddress: false });

    await assert.rejects(
      () => submitCourierApplication({ userId: String(user._id), ...VEHICLE }),
      /адрес в профиле/i,
      "без региона курьер не увидит ни одного заказа",
    );
  });

  it("повторная подача поверх ожидающей отклоняется", async () => {
    const user = await makeUser();
    await submitCourierApplication({ userId: String(user._id), ...VEHICLE });

    await assert.rejects(
      () => submitCourierApplication({ userId: String(user._id), ...VEHICLE }),
      /на рассмотрении/i,
    );
  });
});

describe("модерация заявки курьера", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  /** @returns {Promise<{ courier: any; moderator: any }>} */
  async function pendingCourier() {
    const courier = await makeUser();
    const moderator = await makeUser({ role: "moderator" });
    await submitCourierApplication({ userId: String(courier._id), ...VEHICLE });
    return { courier, moderator };
  }

  it("одобрение открывает приём заказов", async () => {
    const { courier, moderator } = await pendingCourier();

    const profile = await reviewCourierApplication({
      userId: String(courier._id),
      moderatorId: String(moderator._id),
      nextStatus: "approved",
    });

    assert.equal(profile.moderationStatus, "approved");
    assert.equal(profile.isApproved, true);
    assert.ok(profile.reviewedAt);
  });

  it("отказ сохраняет причину", async () => {
    const { courier, moderator } = await pendingCourier();

    const profile = await reviewCourierApplication({
      userId: String(courier._id),
      moderatorId: String(moderator._id),
      nextStatus: "rejected",
      comment: "Госномер не читается на фото",
    });

    assert.equal(profile.moderationStatus, "rejected");
    assert.equal(profile.moderationComment, "Госномер не читается на фото");
    assert.equal(profile.isApproved, false);
  });

  it("курьер узнаёт о решении", async () => {
    const { courier, moderator } = await pendingCourier();

    await reviewCourierApplication({
      userId: String(courier._id),
      moderatorId: String(moderator._id),
      nextStatus: "approved",
    });

    const notes = await UserInAppNotificationModel.find({
      userId: courier._id,
      kind: "courier_moderation",
    }).lean();
    assert.equal(notes.length, 1);
    assert.match(notes[0].message, /одобрена/i);
  });

  it("после отказа можно переподать, и причина стирается", async () => {
    const { courier, moderator } = await pendingCourier();
    await reviewCourierApplication({
      userId: String(courier._id),
      moderatorId: String(moderator._id),
      nextStatus: "rejected",
      comment: "Не читается номер",
    });

    const profile = await submitCourierApplication({
      userId: String(courier._id),
      ...VEHICLE,
      vehiclePlate: "а777аа77",
    });

    assert.equal(profile.moderationStatus, "pending");
    assert.equal(profile.moderationComment, "", "старая причина не висит на новой заявке");
    assert.equal(profile.reviewedAt, null);
  });

  it("решение по неподававшему отклоняется", async () => {
    const user = await makeUser();
    const moderator = await makeUser({ role: "moderator" });

    await assert.rejects(
      () =>
        reviewCourierApplication({
          userId: String(user._id),
          moderatorId: String(moderator._id),
          nextStatus: "approved",
        }),
      /не подавал заявку/i,
    );
  });

  it("произвольный статус поставить нельзя", async () => {
    const { courier, moderator } = await pendingCourier();

    await assert.rejects(
      () =>
        reviewCourierApplication({
          userId: String(courier._id),
          moderatorId: String(moderator._id),
          nextStatus: "pending",
        }),
      /одобрить или отклонить/i,
    );
  });
});

describe("очередь модерации", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(clearMongoCollections);

  it("показывает только заявки нужного статуса", async () => {
    const moderator = await makeUser({ role: "moderator" });
    const waiting = await makeUser();
    const approved = await makeUser();
    await makeUser(); // вообще не подавал

    await submitCourierApplication({ userId: String(waiting._id), ...VEHICLE });
    await submitCourierApplication({ userId: String(approved._id), ...VEHICLE });
    await reviewCourierApplication({
      userId: String(approved._id),
      moderatorId: String(moderator._id),
      nextStatus: "approved",
    });

    const queue = await listCourierApplications({ status: "pending" });

    assert.equal(queue.total, 1);
    assert.equal(queue.applications[0].userId, String(waiting._id));
  });

  it("отдаёт модератору данные авто и регион, но не паспорт", async () => {
    const courier = await makeUser();
    await submitCourierApplication({ userId: String(courier._id), ...VEHICLE });

    const [row] = (await listCourierApplications({ status: "pending" })).applications;

    assert.equal(row.vehicleMake, "Lada Granta");
    assert.equal(row.regionCode, "RU-MOW");
    assert.ok(row.userName);
    assert.equal(row.passport, undefined, "паспорта в очереди быть не должно");
    assert.equal(row.passwordHash, undefined);
  });
});
