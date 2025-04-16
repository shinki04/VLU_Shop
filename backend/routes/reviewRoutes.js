import express from "express";
import {
  addProductReview,
  updateProductReview,
  getProductReviews,
  deleteProductReview,
  getUserReviews,
  getAllReviews,
} from "../controllers/reviewController.js";

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Định nghĩa các route với phương thức HTTP khác nhau cho cùng một route
router.get("/", authMiddleware, isAdmin, getAllReviews); // GET để lấy tất cả reviews từ TẤT CẢ user
router.route("/user").get(authMiddleware, getUserReviews); // GET để lấy tất cả reviews từ MỘT user

router
  .route("/:id")
  .post(authMiddleware, addProductReview) // POST để thêm review
  .put(authMiddleware, updateProductReview) // PUT để cập nhật review
  .get(getProductReviews) // GET để lấy các review của một sản phẩm
  .delete(authMiddleware, deleteProductReview); // DELETE để xóa review

export default router;
