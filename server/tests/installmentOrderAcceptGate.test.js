import assert from "node:assert/strict";
import { test } from "node:test";

import {
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
  INSTALLMENT_CONTRACT_STATUS_CANCELLED,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
} from "../constants/installmentConstants.js";
import {
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_CANCELLED,
} from "../constants/orderConstants.js";
import {
  isInstallmentContractVisibleInLists,
  isInstallmentOrderAcceptedBySeller,
} from "../services/installment/installmentOrderAcceptGate.js";

test("isInstallmentOrderAcceptedBySeller: pending order not accepted", () => {
  assert.equal(
    isInstallmentOrderAcceptedBySeller({
      status: ORDER_STATUS_PENDING,
      items: [{ status: ORDER_STATUS_PENDING }],
    }),
    false,
  );
});

test("isInstallmentOrderAcceptedBySeller: shipped item accepted", () => {
  assert.equal(
    isInstallmentOrderAcceptedBySeller({
      status: ORDER_STATUS_PENDING,
      items: [{ status: ORDER_STATUS_SHIPPED }],
    }),
    true,
  );
  assert.equal(
    isInstallmentOrderAcceptedBySeller({ status: ORDER_STATUS_SHIPPED, items: [] }),
    true,
  );
});

test("isInstallmentOrderAcceptedBySeller: cancelled never accepted", () => {
  assert.equal(
    isInstallmentOrderAcceptedBySeller({
      status: ORDER_STATUS_CANCELLED,
      items: [{ status: ORDER_STATUS_SHIPPED }],
    }),
    false,
  );
});

test("isInstallmentContractVisibleInLists: hide live contract until accept", () => {
  const pendingOrder = {
    status: ORDER_STATUS_PENDING,
    items: [{ status: ORDER_STATUS_PENDING }],
  };
  assert.equal(
    isInstallmentContractVisibleInLists(
      { status: INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT },
      pendingOrder,
    ),
    false,
  );
  assert.equal(
    isInstallmentContractVisibleInLists(
      { status: INSTALLMENT_CONTRACT_STATUS_ACTIVE },
      pendingOrder,
    ),
    false,
  );
});

test("isInstallmentContractVisibleInLists: show after seller accept", () => {
  assert.equal(
    isInstallmentContractVisibleInLists(
      { status: INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT },
      { status: ORDER_STATUS_SHIPPED, items: [{ status: ORDER_STATUS_SHIPPED }] },
    ),
    true,
  );
});

test("isInstallmentContractVisibleInLists: cancelled/completed always visible", () => {
  const pendingOrder = {
    status: ORDER_STATUS_PENDING,
    items: [{ status: ORDER_STATUS_PENDING }],
  };
  assert.equal(
    isInstallmentContractVisibleInLists(
      { status: INSTALLMENT_CONTRACT_STATUS_CANCELLED },
      pendingOrder,
    ),
    true,
  );
  assert.equal(
    isInstallmentContractVisibleInLists(
      { status: INSTALLMENT_CONTRACT_STATUS_COMPLETED },
      null,
    ),
    true,
  );
});
