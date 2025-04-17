import express from "express";
import {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  searchCategoryByKeyword,
} from "../controllers/categoryController.js";

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.route("/").post(authMiddleware, isAdmin, createCategory);
router.route("/categories").get(listCategory);
router.route("/search").get(searchCategoryByKeyword);
router
  .route("/:categoryId")
  .delete(authMiddleware, isAdmin, removeCategory)
  .put(authMiddleware, isAdmin, updateCategory);

export default router;
