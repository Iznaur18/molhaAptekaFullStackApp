import assert from "node:assert/strict";
import test from "node:test";

import {
  isInnLengthValidForLegalForm,
  isValidInn,
  safeDealApplicationBodySchema,
  SELLER_LEGAL_FORM_IP,
  SELLER_LEGAL_FORM_OOO,
} from "../src/sellerSafeDeal.js";

// ИНН ООО «ТЮРКПАЗАР» — реальный номер площадки, контрольная сумма сходится.
const VALID_INN_10 = "2368017598";
// 12 цифр с обеими контрольными цифрами (ИП).
const VALID_INN_12 = "500100732259";

test("isValidInn принимает корректные ИНН на 10 и 12 цифр", () => {
  assert.equal(isValidInn(VALID_INN_10), true);
  assert.equal(isValidInn(VALID_INN_12), true);
});

test("isValidInn ловит опечатку в одной цифре", () => {
  assert.equal(isValidInn("2368017597"), false);
  assert.equal(isValidInn("500100732258"), false);
});

test("isValidInn отвергает нецифры и неверную длину", () => {
  assert.equal(isValidInn(""), false);
  assert.equal(isValidInn("23680175"), false);
  assert.equal(isValidInn("23680175989"), false);
  assert.equal(isValidInn("236801759a"), false);
  assert.equal(isValidInn(null), false);
});

test("isInnLengthValidForLegalForm разводит ИП и ООО по длине", () => {
  assert.equal(isInnLengthValidForLegalForm(SELLER_LEGAL_FORM_OOO, VALID_INN_10), true);
  assert.equal(isInnLengthValidForLegalForm(SELLER_LEGAL_FORM_OOO, VALID_INN_12), false);
  assert.equal(isInnLengthValidForLegalForm(SELLER_LEGAL_FORM_IP, VALID_INN_12), true);
  assert.equal(isInnLengthValidForLegalForm(SELLER_LEGAL_FORM_IP, VALID_INN_10), false);
  assert.equal(isInnLengthValidForLegalForm("", VALID_INN_10), false);
});

test("safeDealApplicationBodySchema пропускает валидную заявку ООО", () => {
  const parsed = safeDealApplicationBodySchema.parse({
    legalForm: SELLER_LEGAL_FORM_OOO,
    inn: ` ${VALID_INN_10} `,
  });
  assert.deepEqual(parsed, { legalForm: SELLER_LEGAL_FORM_OOO, inn: VALID_INN_10 });
});

test("safeDealApplicationBodySchema ругается на длину раньше, чем на контрольную сумму", () => {
  const result = safeDealApplicationBodySchema.safeParse({
    legalForm: SELLER_LEGAL_FORM_IP,
    inn: VALID_INN_10,
  });
  assert.equal(result.success, false);
  assert.match(result.error.issues[0].message, /12 цифр/);
});

test("safeDealApplicationBodySchema отвергает битую контрольную сумму", () => {
  const result = safeDealApplicationBodySchema.safeParse({
    legalForm: SELLER_LEGAL_FORM_OOO,
    inn: "2368017597",
  });
  assert.equal(result.success, false);
  assert.match(result.error.issues[0].message, /с ошибкой/);
});

test("safeDealApplicationBodySchema не принимает самозанятого и физлицо", () => {
  for (const legalForm of ["self_employed", "person", ""]) {
    const result = safeDealApplicationBodySchema.safeParse({
      legalForm,
      inn: VALID_INN_12,
    });
    assert.equal(result.success, false, `legalForm=${legalForm} должен быть отклонён`);
  }
});
