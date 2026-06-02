import mongoose from 'mongoose';

import {
    INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
    INSTALLMENT_CONTRACT_STATUSES,
    INSTALLMENT_PAYMENT_STATUSES,
} from '../constants/installmentConstants.js';

const InstallmentPaymentSchema = new mongoose.Schema(
    {
        paymentIndex: {
            type: Number,
            required: true,
            min: 1,
        },
        amountRub: {
            type: Number,
            required: true,
            min: 0,
        },
        dueAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: INSTALLMENT_PAYMENT_STATUSES,
            required: true,
        },
        paidAt: {
            type: Date,
            default: null,
        },
        buyerMarkedPaidAt: {
            type: Date,
            default: null,
        },
        confirmedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        reminderSentAt: {
            type: Date,
            default: null,
        },
        overdueNotifiedAt: {
            type: Date,
            default: null,
        },
    },
    { _id: true },
);

const InstallmentContractSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        programId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductInstallmentProgram',
            required: true,
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        buyerUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sellerUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            default: null,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        planTitle: {
            type: String,
            required: true,
            trim: true,
        },
        monthsCount: {
            type: Number,
            required: true,
            min: 1,
        },
        monthlyPaymentRub: {
            type: Number,
            required: true,
            min: 0,
        },
        totalAmountRub: {
            type: Number,
            required: true,
            min: 0,
        },
        paidAmountRub: {
            type: Number,
            default: 0,
            min: 0,
        },
        productNameAtContract: {
            type: String,
            required: true,
            trim: true,
        },
        productUnitPriceAtContract: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: INSTALLMENT_CONTRACT_STATUSES,
            default: INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
        },
        payments: {
            type: [InstallmentPaymentSchema],
            default: [],
        },
        finalDueAt: {
            type: Date,
            required: true,
        },
        nextPaymentDueAt: {
            type: Date,
            default: null,
        },
        hasOverduePayment: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
        cancelledByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        cancellationReason: {
            type: String,
            default: '',
            trim: true,
            maxlength: 2000,
        },
    },
    { timestamps: true },
);

InstallmentContractSchema.index({ buyerUserId: 1, createdAt: -1 });
InstallmentContractSchema.index({ sellerUserId: 1, createdAt: -1 });
InstallmentContractSchema.index({ productId: 1, status: 1 });
InstallmentContractSchema.index({ status: 1, nextPaymentDueAt: 1 });

export default mongoose.model('InstallmentContract', InstallmentContractSchema);
