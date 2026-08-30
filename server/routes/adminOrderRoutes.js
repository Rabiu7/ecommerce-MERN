const express = require("express");

const router = express.Router();

const {
  getAllOrders,
  getAdminOrder,
  updateOrderStatus,
} = require("../controllers/adminOrderController");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

// =========================================================
// ADMIN ORDERS
// =========================================================

// All orders
router.get("/", authMiddleware, adminMiddleware, getAllOrders);

// Single order
router.get("/:id", authMiddleware, adminMiddleware, getAdminOrder);

// Update order status
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;
