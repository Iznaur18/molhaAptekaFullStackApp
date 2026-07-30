import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCharacteristicPairSet,
  countMatchingCharacteristicPairs,
  evaluateProductCompareMatch,
  sharesProductNameToken,
  tokenizeProductNameForCompare,
} from "../services/product/productCompareMatch.js";

test("tokenizeProductNameForCompare drops stop words and short tokens", () => {
  assert.deepEqual(tokenizeProductNameForCompare("iPhone 15 для дома"), [
    "iphone",
    "15",
    "дома",
  ]);
});

test("countMatchingCharacteristicPairs is case-insensitive", () => {
  const source = buildCharacteristicPairSet([
    { key: "Цвет", value: "Чёрный" },
    { key: "ОЗУ", value: "8 ГБ" },
    { key: "Память", value: "256 ГБ" },
  ]);
  const count = countMatchingCharacteristicPairs(source, [
    { key: "цвет", value: "чёрный" },
    { key: "ОЗУ", value: "8 гб" },
    { key: "Диагональ", value: "6.1" },
  ]);
  assert.equal(count, 2);
});

test("evaluateProductCompareMatch requires name token and 3 characteristic matches", () => {
  const sourcePairs = buildCharacteristicPairSet([
    { key: "Цвет", value: "Чёрный" },
    { key: "ОЗУ", value: "8 ГБ" },
    { key: "Память", value: "256 ГБ" },
    { key: "SIM", value: "1" },
  ]);
  const sourceTokens = tokenizeProductNameForCompare("Samsung Galaxy S23");

  const ok = evaluateProductCompareMatch({
    sourceNameTokens: sourceTokens,
    sourceCharacteristicPairs: sourcePairs,
    candidateName: "Samsung A54",
    candidateCharacteristics: [
      { key: "Цвет", value: "Чёрный" },
      { key: "ОЗУ", value: "8 ГБ" },
      { key: "Память", value: "256 ГБ" },
    ],
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.characteristicMatches, 3);

  const noName = evaluateProductCompareMatch({
    sourceNameTokens: sourceTokens,
    sourceCharacteristicPairs: sourcePairs,
    candidateName: "Xiaomi Redmi",
    candidateCharacteristics: [
      { key: "Цвет", value: "Чёрный" },
      { key: "ОЗУ", value: "8 ГБ" },
      { key: "Память", value: "256 ГБ" },
    ],
  });
  assert.equal(noName.ok, false);

  assert.equal(sharesProductNameToken(sourceTokens, "galaxy case"), true);
});
