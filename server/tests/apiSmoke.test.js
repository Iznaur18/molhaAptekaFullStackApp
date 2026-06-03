import assert from 'node:assert/strict';
import { after, afterEach, before, test } from 'node:test';

import { ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY } from '../constants/orderConstants.js';
import { ProductModel, UserModel } from '../models/index.js';
import { PRODUCT_MODERATION_APPROVED } from '../constants/productModerationConstants.js';
import {
    buildCookieHeader,
    startHttpTestServer,
    stopHttpTestServer,
} from './helpers/httpTestApp.js';
import {
    clearMongoCollections,
    connectMongoTestReplSet,
    disconnectMongoTestReplSet,
} from './helpers/mongoTestDb.js';

process.env.JWT_SECRET =
    process.env.JWT_SECRET ?? 'smoke-test-jwt-secret-min-32-chars-long';
process.env.NODE_ENV = 'test';

const registerPayload = (suffix) => ({
    email: `smoke-${suffix}@example.com`,
    password: 'secret12',
    passwordConfirm: 'secret12',
    userName: `smokeUser${suffix}`,
});

const productPayload = () => ({
    productName: 'Smoke Test Product',
    productDescription: 'Product description for smoke test',
    productImageUrls: ['https://example.com/product.jpg'],
    productPrice: 100,
    productCategory: 'grocery',
    productIsAvailable: true,
    productStockQuantity: 5,
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

test('GET /health: mongo connected', async () => {
    const response = await request('/health');
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.mongo, 'connected');
});

const parseSuccessData = async (response) => {
    const body = await response.json();
    assert.equal(body.success, true);
    return body.data;
};

test('auth smoke: register → me → logout → me 401', async () => {
    const registerResponse = await request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload('auth')),
    });
    assert.equal(registerResponse.status, 200);

    const authCookie = buildCookieHeader(registerResponse.headers);
    assert.ok(authCookie.includes('access_token'));
    assert.ok(authCookie.includes('refresh_token'));

    const meData = await parseSuccessData(
        await request('/auth/me', {
            headers: { Cookie: authCookie },
        }),
    );
    assert.equal(meData.user.email, 'smoke-auth@example.com');

    const logoutResponse = await request('/auth/logout', {
        method: 'POST',
        headers: { Cookie: authCookie },
    });
    assert.equal(logoutResponse.status, 200);

    const meAfterLogout = await request('/auth/me');
    assert.equal(meAfterLogout.status, 401);
});

test('auth refresh: register → refresh → me', async () => {
    const registerResponse = await request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload('refresh')),
    });
    assert.equal(registerResponse.status, 200);

    const registerCookies = buildCookieHeader(registerResponse.headers);
    assert.ok(registerCookies.includes('refresh_token'));

    const refreshResponse = await request('/auth/refresh', {
        method: 'POST',
        headers: { Cookie: registerCookies },
    });
    assert.equal(refreshResponse.status, 200);

    const refreshedCookies = buildCookieHeader(refreshResponse.headers);
    assert.ok(refreshedCookies.includes('access_token'));

    const meData = await parseSuccessData(
        await request('/auth/me', {
            headers: { Cookie: refreshedCookies },
        }),
    );
    assert.equal(meData.user.email, 'smoke-refresh@example.com');
});

test('product smoke: GET /product публичный, POST /product с auth', async () => {
    const catalogData = await parseSuccessData(await request('/product'));
    assert.ok(Array.isArray(catalogData.products));

    const registerResponse = await request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload('product')),
    });
    assert.equal(registerResponse.status, 200);
    const authCookie = buildCookieHeader(registerResponse.headers);

    const createData = await parseSuccessData(
        await request('/product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: authCookie,
            },
            body: JSON.stringify(productPayload()),
        }),
    );
    assert.ok(createData.product?._id);
});

test('order smoke: без verify email → 403', async () => {
    const registerResponse = await request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload('order')),
    });
    assert.equal(registerResponse.status, 200);
    const authCookie = buildCookieHeader(registerResponse.headers);
    const meData = await parseSuccessData(
        await request('/auth/me', { headers: { Cookie: authCookie } }),
    );
    const sellerId = meData.user._id;

    await UserModel.findByIdAndUpdate(sellerId, { isEmailVerified: true });

    const createProductData = await parseSuccessData(
        await request('/product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: authCookie,
            },
            body: JSON.stringify(productPayload()),
        }),
    );
    const product = createProductData.product;
    await ProductModel.findByIdAndUpdate(product._id, {
        productModerationStatus: PRODUCT_MODERATION_APPROVED,
    });

    const buyerResponse = await request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload('buyer')),
    });
    const buyerCookie = buildCookieHeader(buyerResponse.headers);

    const orderResponse = await request('/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Cookie: buyerCookie,
        },
        body: JSON.stringify({
            items: [{ productId: String(product._id), quantity: 1 }],
            deliveryAddress: 'Москва, Тверская 1',
            deliveryAddressFlat: '1',
            paymentMethod: ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
        }),
    });
    assert.equal(orderResponse.status, 403);
});
