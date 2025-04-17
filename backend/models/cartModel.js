import mongoose from "mongoose";
const { Schema } = mongoose;

// Schema cho giỏ hàng
const cartItemSchema = new Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, default: 1, required: true, index: true }, // Số lượng sản phẩm trong giỏ
    price: { type: Number, required: true, index: true }, // Lưu giá sản phẩm khi thêm vào giỏ
  },
  { timestamps: true, index: true } // Tự động tạo createdAt và updatedAt
);

// Schema cho giỏ hàng
const cartSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  
      required: true,
    },
    items: [cartItemSchema], // Danh sách các sản phẩm trong giỏ
  },
  { timestamps: true } // Tự động tạo createdAt và updatedAt
);

cartItemSchema.index({ createdAt: -1 });
cartItemSchema.index({ updatedAt: -1 });
cartSchema.index({ user: 1 });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
