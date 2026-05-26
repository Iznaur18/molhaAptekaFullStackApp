import mongoose from 'mongoose';

const UserInAppNotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        kind: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            default: null,
        },
        actorUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

UserInAppNotificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

export default mongoose.model('UserInAppNotification', UserInAppNotificationSchema);
