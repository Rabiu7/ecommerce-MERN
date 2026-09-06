const express = require("express");

const router = express.Router();

const {
  getAllReviews,
  updateReviewVerification,
  deleteReview,
  createReview,
  checkUserReview,
} = require("../controllers/reviewsController");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

// ===============================
// ADMIN
// ===============================

router.get("/", getAllReviews);

router.put(
  "/:id/verify",
  authMiddleware,
  adminMiddleware,
  updateReviewVerification,
);

router.delete("/:id", authMiddleware, adminMiddleware, deleteReview);

// ===============================
// CUSTOMER
// ===============================

// Create review
router.post("/", authMiddleware, createReview);

// Check whether current user reviewed product
router.get("/product/:productId", authMiddleware, checkUserReview);

module.exports = router;
