import mongoose from 'mongoose';

import {
    ORDER_LINE_ITEM_QUANTITY_MIN,
    ORDER_PAYMENT_METHODS,
    ORDER_SCHEMA_VERSION,
    ORDER_STATUSES,
    ORDER_STATUS_PENDING,
} from '../constants/orderConstants.js';

const OrderLineItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: ORDER_LINE_ITEM_QUANTITY_MIN,
        },
        unitPriceAtOrder: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            required: true,
            enum: ORDER_STATUSES,
            default: ORDER_STATUS_PENDING,
        },
        deliveredAt: {
            type: Date,
            default: null,
        },
        confirmedAt: {
            type: Date,
            default: null,
        },
        deliveredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        confirmedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { _id: true },
);

const OrderSchema = new mongoose.Schema(
    {
        userBuyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: {
            type: [OrderLineItemSchema],
            required: true,
            validate: {
                validator: (value) => Array.isArray(value) && value.length > 0,
                message: 'Заказ должен содержать хотя бы одну позицию',
            },
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryAddress: {
            type: String,
            required: true,
            trim: true,
        },
        deliveryAddressFlat: {
            type: String,
            required: true,
            trim: true,
        },
        deliveryAddressFiasId: {
            type: String,
            trim: true,
            default: '',
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ORDER_PAYMENT_METHODS,
        },
        status: {
            type: String,
            required: true,
            enum: ORDER_STATUSES,
            default: ORDER_STATUS_PENDING,
        },
        schemaVersion: {
            type: Number,
            required: true,
            default: ORDER_SCHEMA_VERSION,
        },
    },
    { timestamps: true },
);

OrderSchema.index({ userBuyerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Order', OrderSchema);
