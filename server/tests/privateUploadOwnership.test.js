import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { PrivateUploadModel } = await import("../models/index.js");
const { isForeignPrivateUpload, isPrivateUploadOwnedBy } = await import(
  "../services/upload/privateUploadOwnership.js"
);

const OWNER = "aaaaaaaaaaaaaaaaaaaaaaaa";
const STRANGER = "bbbbbbbbbbbbbbbbbbbbbbbb";

describe("владение приватной загрузкой", () => {
  before(connectMongoTestReplSet);
  after(disconnectMongoTestReplSet);
  beforeEach(async () => {
    await clearMongoCollections();
    await PrivateUploadModel.create({
      filename: "selfie.webp",
      uploaderId: OWNER,
      purpose: "passport-selfie",
    });
  });

  it("чужое приватное фото распознаётся как чужое", async () => {
    assert.equal(
      await isForeignPrivateUpload(STRANGER, "/upload/private/selfie.webp"),
      true,
      "иначе чужое селфи с паспортом можно приложить к своей анкете",
    );
  });

  it("своё — не чужое", async () => {
    assert.equal(
      await isForeignPrivateUpload(OWNER, "/upload/private/selfie.webp"),
      false,
    );
  });

  it("незнакомое имя файла считается чужим", async () => {
    assert.equal(
      await isForeignPrivateUpload(OWNER, "/upload/private/nobody-knows.webp"),
      true,
      "иначе подойдёт любое выдуманное имя",
    );
  });

  it("публичная ссылка проверку не проходит и не проваливает", async () => {
    assert.equal(
      await isForeignPrivateUpload(STRANGER, "/uploads/legacy.jpg"),
      false,
      "старые анкеты с публичным фото должны продолжать работать",
    );
    assert.equal(await isForeignPrivateUpload(STRANGER, ""), false);
  });

  it("владение по имени файла определяется отдельно", async () => {
    assert.equal(await isPrivateUploadOwnedBy(OWNER, "selfie.webp"), true);
    assert.equal(await isPrivateUploadOwnedBy(STRANGER, "selfie.webp"), false);
  });
});
