import mongoose from "mongoose";
import reviewModel from "./reviewModel.js";
const { ObjectId } = mongoose.Schema;

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    images: { type: [String], required: true },
    brand: { type: String, required: true },
    // quantity: { type: Number, required: true },
    category: { type: ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review", // Tham chiếu đến Review model
      },
    ],
    rating: { type: Number, required: true, default: 0, index: true },
    numReviews: { type: Number, required: true, default: 0, index: true },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0, index: true },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
