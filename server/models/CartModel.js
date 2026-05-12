import mongoose from 'mongoose';

const { Schema } = mongoose;

const CartSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        items: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true },
);

export default mongoose.model('Cart', CartSchema);
