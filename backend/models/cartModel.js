import mongoose from "mongoose";
const { Schema } = mongoose;

// Schema cho giỏ hàng
const cartItemSchema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, default: 1, required: true },
    price: { type: Number, required: true }, // Lưu giá sản phẩm khi thêm vào giỏ
  },
  { timestamps: true } // Tự động tạo createdAt và updatedAt
);

// Schema cho giỏ hàng
const cartSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema], // Danh sách các sản phẩm trong giỏ
  },
  { timestamps: true } // Tự động tạo createdAt và updatedAt
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
