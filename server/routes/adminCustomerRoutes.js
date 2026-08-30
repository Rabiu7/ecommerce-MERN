const express = require("express");

const router = express.Router();

const {
  getAllCustomers,
  getCustomer,
  getCustomerOrders,
} = require("../controllers/adminCustomerController");

const { authMiddleware } = require("../middleware/authMiddleware");

// =========================================================
// ADMIN CUSTOMERS
// =========================================================

// All customers
router.get("/", authMiddleware, getAllCustomers);

// Single customer
router.get("/:id", authMiddleware, getCustomer);

// Customer orders
router.get("/:id/orders", authMiddleware, getCustomerOrders);

module.exports = router;
