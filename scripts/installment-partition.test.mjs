import assert from "node:assert/strict";
import { test } from "node:test";

import { partitionInstallmentContractPayments } from "../client/src/entities/installment/lib/partitionInstallmentContractPayments.js";

const statuses = {
  due: "due",
  overdue: "overdue",
  pendingConfirmation: "pending_confirmation",
  paid: "paid",
};

test("partitionInstallmentContractPayments splits focus, upcoming and history", () => {
  const payments = [
    { paymentIndex: 1, status: "paid" },
    { paymentIndex: 2, status: "due" },
    { paymentIndex: 3, status: "pending_confirmation" },
    { paymentIndex: 4, status: "scheduled" },
  ];

  const result = partitionInstallmentContractPayments(payments, statuses);

  assert.equal(result.history.length, 1);
  assert.equal(result.focus.length, 2);
  assert.equal(result.upcoming.length, 1);
  assert.equal(result.focus[0].paymentIndex, 2);
  assert.equal(result.upcoming[0].paymentIndex, 4);
});
