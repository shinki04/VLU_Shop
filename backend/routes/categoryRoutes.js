import express from "express";
const router = express.Router();
import {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  findCategoryById,
} from "../controllers/categoryController.js";

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

router.route("/").post(authMiddleware, isAdmin, createCategory);
router.route("/:categoryId").put(authMiddleware, isAdmin, updateCategory);
router
  .route("/:categoryId")
  .delete(authMiddleware, isAdmin, removeCategory);

router.route("/categories").get(listCategory);
router.route("/:id").get(findCategoryById);

export default router;  