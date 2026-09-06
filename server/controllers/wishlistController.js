const Wishlist = require("../models/wishlistModel");

// GET /api/wishlist/:userId
exports.getWishlist = (req, res) => {
  const { userId } = req.params;

  Wishlist.getByUserId(userId, (err, results) => {
    if (err) {
      console.error("Get wishlist error:", err);

      return res.status(500).json({
        message: "Failed to fetch wishlist",
        error: err.message,
      });
    }

    res.json({
      success: true,
      wishlist: results,
    });
  });
};

// POST /api/wishlist
exports.addToWishlist = (req, res) => {
  const { user_id, product_id } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({
      message: "user_id and product_id are required",
    });
  }

  Wishlist.exists(user_id, product_id, (err, results) => {
    if (err) {
      console.error("Check wishlist error:", err);

      return res.status(500).json({
        message: "Failed to check wishlist",
        error: err.message,
      });
    }

    if (results.length > 0) {
      return res.status(409).json({
        message: "Product already exists in wishlist",
      });
    }

    Wishlist.add(user_id, product_id, (err) => {
      if (err) {
        console.error("Add wishlist error:", err);

        return res.status(500).json({
          message: "Failed to add to wishlist",
          error: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Product added to wishlist",
      });
    });
  });
};

// DELETE /api/wishlist/:userId/:productId
exports.removeFromWishlist = (req, res) => {
  const { userId, productId } = req.params;

  Wishlist.remove(userId, productId, (err, result) => {
    if (err) {
      console.error("Remove wishlist error:", err);

      return res.status(500).json({
        message: "Failed to remove from wishlist",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Product not found in wishlist",
      });
    }

    res.json({
      success: true,
      message: "Product removed from wishlist",
    });
  });
};
