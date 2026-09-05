const express = require("express");

const router = express.Router();

const {
  getAllReviews,
  updateReviewVerification,
  deleteReview,
  createReview,
  checkUserReview,
} = require("../controllers/reviewsController");

// ===============================
// ADMIN
// ===============================

router.get("/", getAllReviews);

router.put("/:id/verify", updateReviewVerification);

router.delete("/:id", deleteReview);

// ===============================
// CUSTOMER
// ===============================

// Create review
router.post("/", createReview);

// Check whether current user reviewed product
router.get("/product/:productId", checkUserReview);

module.exports = router;
