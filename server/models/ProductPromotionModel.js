import mongoose from 'mongoose';
import {
    PRODUCT_PROMOTION_PAYMENT_METHODS,
    PRODUCT_PROMOTION_PAYMENT_METHOD_RUB,
    PRODUCT_PROMOTION_STATUSES,
} from '../constants/productPromotionConstants.js';

const ProductPromotionSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: PRODUCT_PROMOTION_STATUSES,
            required: true,
        },
        tariffCode: {
            type: String,
            required: true,
            trim: true,
        },
        tariffTitle: {
            type: String,
            required: true,
            trim: true,
        },
        durationHours: {
            type: Number,
            required: true,
            min: 1,
        },
        amountRub: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentMethod: {
            type: String,
            enum: PRODUCT_PROMOTION_PAYMENT_METHODS,
            default: PRODUCT_PROMOTION_PAYMENT_METHOD_RUB,
            required: true,
        },
        amountPoints: {
            type: Number,
            default: null,
            min: 0,
        },
        pointsChargedAt: {
            type: Date,
            default: null,
        },
        pointsRefundedAt: {
            type: Date,
            default: null,
        },
        rubChargedAt: {
            type: Date,
            default: null,
        },
        rubRefundedAt: {
            type: Date,
            default: null,
        },
        approvedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        activatedAt: {
            type: Date,
            default: null,
        },
        activeUntil: {
            type: Date,
            default: null,
        },
        reminderSentAt: {
            type: Date,
            default: null,
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

ProductPromotionSchema.index({ sellerId: 1, createdAt: -1 });
ProductPromotionSchema.index({ status: 1, createdAt: 1 });
ProductPromotionSchema.index({ productId: 1, createdAt: -1 });
ProductPromotionSchema.index({ status: 1, activeUntil: 1 });

export default mongoose.model('ProductPromotion', ProductPromotionSchema);
