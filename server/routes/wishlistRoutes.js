const express = require("express");

const router = express.Router();

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

// Get user's wishlist
router.get("/:userId", getWishlist);

// Add product to wishlist
router.post("/", addToWishlist);

// Remove product from wishlist
router.delete("/:userId/:productId", removeFromWishlist);

module.exports = router;
