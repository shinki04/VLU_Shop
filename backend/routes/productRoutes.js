import express from "express";
import {
  addProduct,
  updateProductDetails,
  fetchAllProducts,
  fetchProductById,
  fetchNewProducts,
  removeProduct,
  filterProducts,
} from "../controllers/productController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.route("/")
.get(fetchAllProducts) // Lấy tất cả sản phẩm
.post(authMiddleware, isAdmin, addProduct)

router.route("/new").get(fetchNewProducts) // Lấy sản phẩm mới nhất
router.route("/filter").get(filterProducts) // Lọc sản phẩm theo các tiêu chí

router.route("/:productId")
.get(fetchProductById) // Lấy sản phẩm theo ID
.put(authMiddleware, isAdmin, updateProductDetails) // Cập nhật sản phẩm
.delete(authMiddleware, isAdmin, removeProduct) // Xóa sản phẩm

export default router;
