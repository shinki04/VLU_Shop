import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  deleteCart,
} from "../controllers/cartController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Thêm sản phẩm vào giỏ hàng
router.route("/add").post(authMiddleware, addToCart);
router.route("/").get(authMiddleware, getCart);
router
  .route("/:id")
  .put(authMiddleware, updateCart)
  .delete(authMiddleware, deleteCart);

export default router;
