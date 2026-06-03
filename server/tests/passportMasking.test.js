import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { USER_DATA_CONFIRMATION_STATUS_PENDING } from '../constants/userDataConfirmationConstants.js';
import { UserDataConfirmationRequestModel, UserModel } from '../models/index.js';
import { getPendingDataConfirmationRequests } from '../utils/userDataConfirmationHelpers.js';
import {
    connectMongoTestReplSet,
    disconnectMongoTestReplSet,
} from './helpers/mongoTestDb.js';

const suffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

before(async () => {
    await connectMongoTestReplSet();
});

after(async () => {
    await disconnectMongoTestReplSet();
});

test('staff queue маскирует серию и номер паспорта', async () => {
    const id = suffix();
    const user = await UserModel.create({
        userName: `applicant_${id}`,
        email: `applicant_${id}@test.local`,
        passwordHash: 'hash',
    });

    await UserDataConfirmationRequestModel.create({
        userId: user._id,
        status: USER_DATA_CONFIRMATION_STATUS_PENDING,
        passport: {
            lastName: 'Иванов',
            firstName: 'Иван',
            middleName: 'Иванович',
            birthDate: '1990-01-01',
            series: '1234',
            number: '567890',
            issuedBy: 'УФМС',
            departmentCode: '123-456',
            issuedAt: '2010-01-01',
        },
        passportSelfiePhotoUrl: '/uploads/selfie.jpg',
    });

    const { requests } = await getPendingDataConfirmationRequests();
    const row = requests.find((item) => String(item.userId) === String(user._id));
    assert.ok(row);
    assert.equal(row.passport.series, '****');
    assert.equal(row.passport.number, '****7890');
    assert.equal(row.passport.lastName, 'Иванов');
});
