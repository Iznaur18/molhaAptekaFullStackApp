import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import { ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY } from "../constants/orderConstants.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  approveProductViaApi,
  confirmUserData,
  createProductViaApi,
  ensureProductCategoryTreeSeeded,
  parseSuccessData,
  registerUserAndGetCookie,
  setUserRole,
  verifyUserEmail,
} from "./helpers/integrationTestHelpers.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
process.env.NODE_ENV = "test";

const STORY_MEDIA_URL = "https://example.com/uploads/smoke-story.jpg";

const buildRaffleBody = () => ({
  title: "Smoke raffle",
  prizeMediaType: "image",
  prizeImageUrl: "https://example.com/prize.jpg",
  targetSales: 10,
  instagramUrl: "https://www.instagram.com/example/",
});

const buildInstallmentProgramBody = () => ({
  isEnabled: true,
  plans: [
    {
      title: "6 months",
      monthsCount: 6,
      monthlyAmountRub: 100,
      firstPaymentRequiredNow: false,
    },
  ],
});

/** @type {import('node:http').Server | null} */
let server = null;
/** @type {(path: string, init?: RequestInit) => Promise<Response>} */
let request = async () => new Response();

before(async () => {
  await connectMongoTestReplSet();
  const testServer = await startHttpTestServer();
  server = testServer.server;
  request = testServer.request;
});

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  if (server) {
    await stopHttpTestServer(server);
  }
  await disconnectMongoTestReplSet();
});

test("stories smoke: feed → create (any user) → author → view", async () => {
  const feedData = await parseSuccessData(await request("/user/stories/feed"));
  assert.ok(Array.isArray(feedData.rings));
  assert.equal(feedData.showStrip, true);
  assert.equal(feedData.canPublish, false);

  const { cookie: userCookie, user } = await registerUserAndGetCookie(
    request,
    "story-user",
  );

  const authedFeed = await parseSuccessData(
    await request("/user/stories/feed", {
      headers: { Cookie: userCookie },
    }),
  );
  assert.equal(authedFeed.canPublish, true);
  assert.equal(authedFeed.showStrip, true);

  const createData = await parseSuccessData(
    await request("/user/stories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userCookie,
      },
      body: JSON.stringify({
        mediaType: "image",
        mediaUrl: STORY_MEDIA_URL,
        captionText: "smoke",
      }),
    }),
  );
  assert.ok(createData.story?._id);
  const storyId = String(createData.story._id);

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    "story-mod",
  );
  await setUserRole(modUser._id, "moderator");

  await parseSuccessData(
    await request("/user/stories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: modCookie,
      },
      body: JSON.stringify({
        mediaType: "image",
        mediaUrl: STORY_MEDIA_URL,
        captionText: "smoke-mod",
      }),
    }),
  );

  const viewerFeed = await parseSuccessData(
    await request("/user/stories/feed", {
      headers: { Cookie: userCookie },
    }),
  );
  assert.ok(viewerFeed.rings.length >= 2);

  const authorData = await parseSuccessData(
    await request(`/user/stories/author/${user._id}`),
  );
  assert.equal(authorData.stories.length, 1);

  const modAuthorData = await parseSuccessData(
    await request(`/user/stories/author/${modUser._id}`),
  );
  assert.equal(modAuthorData.stories.length, 1);

  const viewData = await parseSuccessData(
    await request(`/user/stories/${storyId}/view`, {
      method: "POST",
      headers: { Cookie: userCookie },
    }),
  );
  assert.match(viewData.message, /просмотр/i);

  const pendingCount = await parseSuccessData(
    await request("/user/stories/reports/pending/count", {
      headers: { Cookie: modCookie },
    }),
  );
  assert.equal(pendingCount.totalReports, 0);
});

test("raffle smoke: featured → create → approve → my", async () => {
  await ensureProductCategoryTreeSeeded();

  await parseSuccessData(await request("/product/raffles/featured"));

  const { cookie: sellerCookie, user: seller } = await registerUserAndGetCookie(
    request,
    "raffle-seller",
  );

  const blocked = await request("/product/raffles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sellerCookie,
    },
    body: JSON.stringify(buildRaffleBody()),
  });
  assert.equal(blocked.status, 403);

  await confirmUserData(seller._id);

  const createResponse = await request("/product/raffles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sellerCookie,
    },
    body: JSON.stringify(buildRaffleBody()),
  });
  assert.equal(createResponse.status, 201);
  const createData = await parseSuccessData(createResponse);
  const raffleId = String(createData.raffle._id);
  assert.equal(createData.raffle.status, "pending_staff");

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    "raffle-mod",
  );
  await setUserRole(modUser._id, "moderator");

  await parseSuccessData(
    await request(`/product/raffles/${raffleId}/approve`, {
      method: "PATCH",
      headers: { Cookie: modCookie },
    }),
  );

  const byId = await parseSuccessData(await request(`/product/raffles/${raffleId}`));
  assert.equal(String(byId.raffle._id), raffleId);
  assert.equal(byId.raffle.status, "active");

  const myData = await parseSuccessData(
    await request("/product/raffles/my", {
      headers: { Cookie: sellerCookie },
    }),
  );
  assert.equal(String(myData.raffle._id), raffleId);
  assert.equal(myData.raffle.status, "active");
});

test("installment smoke: program → contract → my list", async () => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: sellerCookie, user: seller } = await registerUserAndGetCookie(
    request,
    "inst-seller",
  );
  await verifyUserEmail("int-inst-seller@example.com");
  await confirmUserData(seller._id);

  const product = await createProductViaApi(request, sellerCookie, {
    productName: "Installment smoke product",
  });

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    "inst-mod",
  );
  await setUserRole(modUser._id, "moderator");
  await approveProductViaApi(request, modCookie, String(product._id));

  const productId = String(product._id);

  const programData = await parseSuccessData(
    await request(`/product/${productId}/installment-program`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: sellerCookie,
      },
      body: JSON.stringify(buildInstallmentProgramBody()),
    }),
  );
  assert.equal(programData.program.moderationStatus, "approved");
  const planId = programData.program.plans[0]._id;

  const { cookie: buyerCookie, user: buyer } = await registerUserAndGetCookie(
    request,
    "inst-buyer",
  );
  await verifyUserEmail("int-inst-buyer@example.com");
  await confirmUserData(buyer._id);

  const contractData = await parseSuccessData(
    await request(`/product/${productId}/installment-contracts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: buyerCookie,
      },
      body: JSON.stringify({
        planId,
        quantity: 1,
        deliveryAddress: "Москва, Тверская 1",
        deliveryAddressFlat: "1",
        paymentMethod: ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
      }),
    }),
  );
  assert.ok(contractData.contract?._id);

  const myContracts = await parseSuccessData(
    await request("/installment/contracts/my", {
      headers: { Cookie: buyerCookie },
    }),
  );
  assert.equal(myContracts.contracts.length, 1);
});
