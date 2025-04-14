import mongoose  from ("mongoose");
import { Schema } from "mongoose";
import Product from "./productModel.js"; // Import model sản phẩm nếu cần thiết
// Schema cho giỏ hàng
const cartItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, default: 1, required: true },
  price: { type: Number, required: true },
});

// Schema cho giỏ hàng
const cartSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Liên kết tới User
  items: [cartItemSchema], // Danh sách sản phẩm trong giỏ
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
