import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
process.env.FRONTEND_URL = "https://gitorg.ru";
process.env.YOOKASSA_SHOP_ID = "test-shop";
process.env.YOOKASSA_SECRET_KEY = "test-secret";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { PaymentModel, UserModel } = await import("../models/index.js");
const {
  applyUsersMonthlyDonation,
  countSucceededUsersMonthlyDonationsToday,
  createUsersMonthlyDonation,
  sumUsersMonthlyDonationsInRange,
} = await import("../services/payments/usersMonthlyDonation.js");
const { USERS_MONTHLY_DONATION_DAILY_LIMIT } =
  await import("../constants/yookassaConstants.js");
const { resolveMoscowCalendarDayUtcRange } =
  await import("../services/loyalty/moscowCalendarMonth.js");

const realFetch = globalThis.fetch;
/** @type {{ url: string; init: RequestInit }[]} */
let fetchCalls = [];

/**
 * @param {(url: string, init: RequestInit) => { status?: number; body: unknown }} handler
 */
function stubFetch(handler) {
  globalThis.fetch = async (url, init) => {
    fetchCalls.push({ url: String(url), init });
    const { status = 200, body } = handler(String(url), init);
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body),
    };
  };
}

const paymentPendingResponse = (id) => ({
  status: 200,
  body: {
    id,
    status: "pending",
    amount: { value: "100.00", currency: "RUB" },
    confirmation: { confirmation_url: "https://yoomoney.ru/checkout/pay" },
  },
});

async function createDonor() {
  return UserModel.create({
    userName: `donor-${Math.random().toString(36).slice(2, 10)}`,
    email: `${Math.random().toString(36).slice(2, 10)}@example.com`,
    passwordHash: "x".repeat(60),
    userPhoneNumber: "+79001112233",
    userLoyaltyPoints: 0,
  });
}

describe("usersMonthlyDonation", () => {
  before(async () => {
    await connectMongoTestReplSet();
  });

  after(async () => {
    globalThis.fetch = realFetch;
    await disconnectMongoTestReplSet();
  });

  beforeEach(async () => {
    fetchCalls = [];
    await clearMongoCollections();
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it("creates yookassa payment for donation", async () => {
    const user = await createDonor();
    stubFetch(() => paymentPendingResponse("yk-donation-1"));

    const result = await createUsersMonthlyDonation({
      userId: String(user._id),
      amountRub: 100,
      returnUrl: "/user-list?donated=1",
    });

    assert.equal(result.amountRub, 100);
    assert.ok(result.confirmationUrl.includes("yoomoney"));
    assert.equal(fetchCalls.length, 1);

    const payment = await PaymentModel.findById(result.paymentId).lean();
    assert.equal(payment.purpose, "users_monthly_donation");
    assert.equal(payment.status, "created");
  });

  it("applies succeeded donation without crediting loyalty points", async () => {
    const user = await createDonor();
    const payment = await PaymentModel.create({
      userId: user._id,
      purpose: "users_monthly_donation",
      amountRub: 250,
      status: "created",
      idempotenceKey: "donation-apply-1",
      providerPaymentId: "yk-apply-1",
    });

    const result = await applyUsersMonthlyDonation({
      paymentId: String(payment._id),
      providerStatus: "succeeded",
      providerAmountRub: 250,
    });

    assert.equal(result.applied, true);
    assert.equal(result.donatedRub, 250);

    const refreshedUser = await UserModel.findById(user._id).lean();
    assert.equal(Number(refreshedUser.userLoyaltyPoints ?? 0), 0);

    const refreshedPayment = await PaymentModel.findById(payment._id).lean();
    assert.equal(refreshedPayment.status, "succeeded");
    assert.equal(refreshedPayment.appliedAmount, 250);
  });

  it("enforces 5 successful donations per MSK day", async () => {
    const user = await createDonor();
    const { startUtc } = resolveMoscowCalendarDayUtcRange();
    for (let i = 0; i < USERS_MONTHLY_DONATION_DAILY_LIMIT; i += 1) {
      await PaymentModel.create({
        userId: user._id,
        purpose: "users_monthly_donation",
        amountRub: 10 + i,
        status: "succeeded",
        idempotenceKey: `donation-limit-${i}`,
        providerPaymentId: `yk-limit-${i}`,
        appliedAt: new Date(startUtc.getTime() + i * 1000),
        appliedAmount: 10 + i,
      });
    }

    const count = await countSucceededUsersMonthlyDonationsToday({
      userId: String(user._id),
    });
    assert.equal(count, USERS_MONTHLY_DONATION_DAILY_LIMIT);

    await assert.rejects(
      () =>
        createUsersMonthlyDonation({
          userId: String(user._id),
          amountRub: 50,
          returnUrl: "/user-list?donated=1",
        }),
      (error) => error?.statusCode === 429,
    );
  });

  it("sums donations in range for monthly progress", async () => {
    const user = await createDonor();
    const { startUtc, endUtc } = resolveMoscowCalendarDayUtcRange();
    await PaymentModel.create({
      userId: user._id,
      purpose: "users_monthly_donation",
      amountRub: 120,
      status: "succeeded",
      idempotenceKey: "donation-sum-1",
      providerPaymentId: "yk-sum-1",
      appliedAt: new Date(startUtc.getTime() + 1000),
      appliedAmount: 120,
    });
    await PaymentModel.create({
      userId: user._id,
      purpose: "users_monthly_donation",
      amountRub: 30,
      status: "succeeded",
      idempotenceKey: "donation-sum-2",
      providerPaymentId: "yk-sum-2",
      appliedAt: new Date(startUtc.getTime() + 2000),
      appliedAmount: 30,
    });

    const total = await sumUsersMonthlyDonationsInRange({ startUtc, endUtc });
    assert.equal(total, 150);
  });
});
