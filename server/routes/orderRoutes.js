const express = require("express");

const router = express.Router();

const {
  checkout,
  verifyPayment,
  cashfreeWebhook,
  getOrder,
  getOrders,
  generateInvoice,
} = require("../controllers/orderController");

const { authMiddleware } = require("../middleware/authMiddleware");

// Create checkout
router.post("/checkout", authMiddleware, checkout);

// Verify payment
router.post("/verify-payment", authMiddleware, verifyPayment);

// Cashfree webhook
router.post("/cashfree/webhook", cashfreeWebhook);

// All orders
router.get("/", authMiddleware, getOrders);

// Invoice
router.get("/:id/invoice", authMiddleware, generateInvoice);

// Single order
router.get("/:id", authMiddleware, getOrder);

module.exports = router;
