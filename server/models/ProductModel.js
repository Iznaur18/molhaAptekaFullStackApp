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
    
},{timestamps: true}
)

export default mongoose.model('Product', ProductSchema);