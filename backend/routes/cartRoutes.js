import express from "express";
import {
    addToCart,
    getCart,
    deleteCart,
    updateCart,
} from "../controllers/cartController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();

// Thêm sản phẩm vào giỏ hàng
router.route("/")
.post(authMiddleware, addToCart)
.get(authMiddleware, getCart)
.put(authMiddleware, updateCart)
.delete(authMiddleware, deleteCart);

export default router;
