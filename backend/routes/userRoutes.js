import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  findUserById,
  getCurrentUser,
  deleteUserById,
  updateCurrentUser,
  updateUserById,
  verifyEmail,
  forgotPassword,
  resetPassword,
  searchUsers,
  createUserByAdmin,
} from "../controllers/authController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(authMiddleware, isAdmin, getAllUsers)
  .post(authMiddleware, isAdmin, createUserByAdmin);

router.route("/search").get(authMiddleware, isAdmin, searchUsers);

router
  .route("/profile")
  .get(authMiddleware, getCurrentUser)
  .put(authMiddleware, updateCurrentUser);
// Admin Route
router
  .route("/:id")
  .get(authMiddleware, isAdmin, findUserById)
  .delete(authMiddleware, isAdmin, deleteUserById)
  .put(authMiddleware, isAdmin, updateUserById);

export default router;
