import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    productName: {type: String, required: true},
    productDescription: String,
    productPrice: {type: Number, required: true},
    productSeller: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productCategory: {
        type: String,
        enum: ['electronics', 'clothing', 'food'],
        required: true
    },
    productIsAvailable: {
        type: Boolean,
        default: true
    },
},{timestamps: true}
)

export default mongoose.model('Product', ProductSchema);