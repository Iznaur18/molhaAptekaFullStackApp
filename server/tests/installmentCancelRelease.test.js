import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { cancelLinkedOrderForInstallmentContract } from '../utils/cancelLinkedOrderForInstallmentContract.js';
import {
    createOrderLoyaltyFixture,
    createOrderWithReserveTransaction,
} from './helpers/orderLoyaltyTestHelpers.js';
import { OrderModel, UserModel } from '../models/index.js';
import {
    connectMongoTestReplSet,
    disconnectMongoTestReplSet,
} from './helpers/mongoTestDb.js';

before(async () => {
    await connectMongoTestReplSet();
});

after(async () => {
    await disconnectMongoTestReplSet();
});

test('cancelLinkedOrderForInstallmentContract снимает резерв продавца', async () => {
    const { seller, buyer, product } = await createOrderLoyaltyFixture({
        sellerPoints: 100,
        loyaltyPointsPerUnit: 10,
    });

    const order = await createOrderWithReserveTransaction({
        buyer,
        seller,
        product,
        quantity: 2,
    });

    const sellerAfterReserve = await UserModel.findById(seller._id).lean();
    assert.equal(sellerAfterReserve.userLoyaltyPointsReserved, 20);

    await cancelLinkedOrderForInstallmentContract(order._id);

    const sellerAfterCancel = await UserModel.findById(seller._id).lean();
    assert.equal(sellerAfterCancel.userLoyaltyPointsReserved, 0);

    const orderAfter = await OrderModel.findById(order._id).lean();
    assert.equal(orderAfter.status, 'cancelled');
    assert.equal(orderAfter.items[0].status, 'cancelled');
    assert.equal(orderAfter.items[0].loyaltyPointsReserveReleased, true);
});
