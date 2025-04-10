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
  resetPassword
} from "../controllers/authController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout",authMiddleware, logoutUser);
router.post("/verify-email",verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/", authMiddleware, isAdmin, getAllUsers);

router
  .route("/profile")
  .get(authMiddleware, getCurrentUser)
  .put(authMiddleware, updateCurrentUser);



// Admin Route
router
  .route("/:id")
  .get(authMiddleware,isAdmin,findUserById)
  .delete(authMiddleware, isAdmin, deleteUserById)
  .put(authMiddleware, isAdmin, updateUserById)

  export default router;
