import mongoose from 'mongoose';

import {
    USER_DATA_CONFIRMATION_STATUSES,
    USER_DATA_CONFIRMATION_STATUS_PENDING,
} from '../constants/userDataConfirmationConstants.js';

const PassportSnapshotSchema = new mongoose.Schema(
    {
        lastName: { type: String, required: true, trim: true, maxlength: 80 },
        firstName: { type: String, required: true, trim: true, maxlength: 80 },
        middleName: { type: String, trim: true, maxlength: 80, default: '' },
        birthDate: { type: Date, required: true },
        series: { type: String, required: true, trim: true, maxlength: 4 },
        number: { type: String, required: true, trim: true, maxlength: 6 },
        issuedBy: { type: String, required: true, trim: true, maxlength: 200 },
        issuedAt: { type: Date, required: true },
        departmentCode: {
            type: String,
            required: true,
            trim: true,
            maxlength: 7,
        },
    },
    { _id: false },
);

const UserDataConfirmationRequestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        passport: {
            type: PassportSnapshotSchema,
            required: true,
        },
        status: {
            type: String,
            enum: USER_DATA_CONFIRMATION_STATUSES,
            default: USER_DATA_CONFIRMATION_STATUS_PENDING,
        },
        staffNote: {
            type: String,
            default: '',
            trim: true,
            maxlength: 2000,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

UserDataConfirmationRequestSchema.index({ status: 1, createdAt: 1 });
UserDataConfirmationRequestSchema.index(
    { userId: 1 },
    {
        unique: true,
        partialFilterExpression: { status: USER_DATA_CONFIRMATION_STATUS_PENDING },
    },
);

export default mongoose.model(
    'UserDataConfirmationRequest',
    UserDataConfirmationRequestSchema,
);
