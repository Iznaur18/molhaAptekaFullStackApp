import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  insertLedgerEntryIdempotent,
  isDuplicateKeyError,
} from "../services/ledger/insertLedgerEntryIdempotent.js";

/** Мини-заглушка mongoose-модели. */
function makeModel({ createImpl, foundDoc = null }) {
  const calls = { create: [], findOne: [] };
  return {
    calls,
    create: async (docs, opts) => {
      calls.create.push({ docs, opts });
      return createImpl(docs, opts);
    },
    findOne: (filter) => {
      calls.findOne.push(filter);
      return {
        session() {
          return this;
        },
        async lean() {
          return foundDoc;
        },
      };
    },
  };
}

const dupErr = Object.assign(new Error("E11000 dup"), { code: 11000 });

describe("isDuplicateKeyError", () => {
  it("распознаёт code=11000 и отвергает прочее", () => {
    assert.equal(isDuplicateKeyError(dupErr), true);
    assert.equal(isDuplicateKeyError(new Error("boom")), false);
    assert.equal(isDuplicateKeyError(null), false);
    assert.equal(isDuplicateKeyError(undefined), false);
  });
});

describe("insertLedgerEntryIdempotent", () => {
  it("created=true возвращает вставленную запись", async () => {
    const model = makeModel({ createImpl: () => [{ _id: "e1", amount: 10 }] });
    const res = await insertLedgerEntryIdempotent({ model, doc: { amount: 10 } });
    assert.deepEqual(res, {
      created: true,
      entry: { _id: "e1", amount: 10 },
      existing: null,
    });
    assert.equal(model.calls.findOne.length, 0);
  });

  it("11000 → created=false и перечитывает existing по existingFilter", async () => {
    const model = makeModel({
      createImpl: () => {
        throw dupErr;
      },
      foundDoc: { _id: "e0", amount: 42, createdAt: new Date(0) },
    });
    const res = await insertLedgerEntryIdempotent({
      model,
      doc: { sourceId: "s1" },
      existingFilter: { sourceId: "s1" },
    });
    assert.equal(res.created, false);
    assert.equal(res.entry, null);
    assert.equal(res.existing.amount, 42);
    assert.deepEqual(model.calls.findOne[0], { sourceId: "s1" });
  });

  it("11000 без existingFilter → created=false, existing=null, без findOne", async () => {
    const model = makeModel({
      createImpl: () => {
        throw dupErr;
      },
    });
    const res = await insertLedgerEntryIdempotent({ model, doc: { sourceId: "s2" } });
    assert.deepEqual(res, { created: false, entry: null, existing: null });
    assert.equal(model.calls.findOne.length, 0);
  });

  it("не-11000 ошибка пробрасывается наверх", async () => {
    const model = makeModel({
      createImpl: () => {
        throw new Error("network down");
      },
    });
    await assert.rejects(
      () => insertLedgerEntryIdempotent({ model, doc: {} }),
      /network down/,
    );
  });

  it("прокидывает session в create только когда он задан", async () => {
    const withSession = makeModel({ createImpl: () => [{ _id: "e" }] });
    await insertLedgerEntryIdempotent({
      model: withSession,
      doc: {},
      session: { id: "sess" },
    });
    assert.deepEqual(withSession.calls.create[0].opts, { session: { id: "sess" } });

    const noSession = makeModel({ createImpl: () => [{ _id: "e" }] });
    await insertLedgerEntryIdempotent({ model: noSession, doc: {} });
    assert.equal(noSession.calls.create[0].opts, undefined);
  });
});
