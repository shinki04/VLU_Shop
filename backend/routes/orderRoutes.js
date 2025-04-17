import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  deleteOrder,
  updateOrder,
  getOrderStats,
  createOrderByAdmin,
} from "../controllers/orderController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(authMiddleware, createOrder)
  .get(authMiddleware, isAdmin, getOrders)

router.route("/admin").post(authMiddleware, isAdmin, createOrderByAdmin);
router.route("/myorders").get(authMiddleware, getMyOrders);

router
  .route("/:id")
  .get(authMiddleware, getOrderById)
  .delete(authMiddleware, deleteOrder)
  .put(authMiddleware, updateOrder);

router.route("/stats").get(authMiddleware, isAdmin, getOrderStats);
router.route("/:id/pay").put(authMiddleware, updateOrderToPaid);

router
  .route("/:id/deliver")
  .put(authMiddleware, isAdmin, updateOrderToDelivered);

export default router;
