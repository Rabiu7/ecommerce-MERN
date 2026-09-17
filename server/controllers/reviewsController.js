const db = require("../config/database");

// ===============================
// GET ALL REVIEWS
// ===============================
const getAllReviews = (req, res) => {
  const sql = `
    SELECT
      r.id,
      r.user_id,
      r.product_id,
      r.rating,
      r.comment,
      r.created_at,
      r.is_verified,

      u.name AS user_name,
      u.email AS user_email,

      p.name AS product_name,
      p.image AS product_image

    FROM reviews r

    JOIN users u
      ON r.user_id = u.id

    JOIN products p
      ON r.product_id = p.id

    ORDER BY r.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get reviews error:", err);

      return res.status(500).json({
        message: "Failed to fetch reviews",
        error: err.message,
      });
    }

    res.status(200).json(results);
  });
};

// ===============================
// VERIFY / UNVERIFY REVIEW
// ===============================
// ===============================
// VERIFY / UNVERIFY REVIEW
// ===============================
const updateReviewVerification = (req, res) => {
  const { id } = req.params;
  const { is_verified } = req.body;

  // First get the product_id of this review
  const getReviewSql = `
    SELECT product_id
    FROM reviews
    WHERE id = ?
  `;

  db.query(getReviewSql, [id], (getErr, reviewResult) => {
    if (getErr) {
      console.error("Get review error:", getErr);

      return res.status(500).json({
        message: "Failed to get review",
        error: getErr.message,
      });
    }

    if (reviewResult.length === 0) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    const productId = reviewResult[0].product_id;

    const updateSql = `
      UPDATE reviews
      SET is_verified = ?
      WHERE id = ?
    `;

    db.query(updateSql, [is_verified, id], (updateErr) => {
      if (updateErr) {
        console.error("Update review error:", updateErr);

        return res.status(500).json({
          message: "Failed to update review",
          error: updateErr.message,
        });
      }

      // Recalculate product rating
      updateProductRating(productId, (ratingErr) => {
        if (ratingErr) {
          return res.status(500).json({
            message: "Review updated but product rating failed to update",
            error: ratingErr.message,
          });
        }

        return res.status(200).json({
          success: true,
          reviewId: id,
          is_verified: Number(is_verified),
          message: is_verified
            ? "Review verified successfully"
            : "Review unverified successfully",
        });
      });
    });
  });
};

// ===============================
// DELETE REVIEW
// ===============================
const deleteReview = (req, res) => {
  const { id } = req.params;

  // First get product_id
  const getReviewSql = `
    SELECT product_id
    FROM reviews
    WHERE id = ?
  `;

  db.query(getReviewSql, [id], (getErr, reviewResult) => {
    if (getErr) {
      console.error("Get review error:", getErr);

      return res.status(500).json({
        message: "Failed to get review",
        error: getErr.message,
      });
    }

    if (reviewResult.length === 0) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    const productId = reviewResult[0].product_id;

    const deleteSql = `
      DELETE FROM reviews
      WHERE id = ?
    `;

    db.query(deleteSql, [id], (err) => {
      if (err) {
        console.error("Delete review error:", err);

        return res.status(500).json({
          message: "Failed to delete review",
          error: err.message,
        });
      }

      // Recalculate product rating
      updateProductRating(productId, (ratingErr) => {
        if (ratingErr) {
          return res.status(500).json({
            message: "Review deleted but product rating failed to update",
            error: ratingErr.message,
          });
        }

        res.status(200).json({
          message: "Review deleted and product rating updated successfully",
        });
      });
    });
  });
};

// ===============================
// CREATE CUSTOMER REVIEW
// ===============================
const createReview = (req, res) => {
  const userId = req.user.id;

  const { product_id, rating, comment } = req.body;

  // ===============================
  // VALIDATION
  // ===============================

  if (!product_id || !rating) {
    return res.status(400).json({
      message: "Product and rating are required",
    });
  }

  const numericRating = Number(rating);

  if (numericRating < 1 || numericRating > 5) {
    return res.status(400).json({
      message: "Rating must be between 1 and 5",
    });
  }

  // ===============================
  // CHECK PRODUCT WAS DELIVERED
  // ===============================

  const purchaseSql = `
    SELECT oi.id
    FROM orders o
    JOIN order_items oi
      ON oi.order_id = o.id
    WHERE o.user_id = ?
      AND LOWER(o.order_status) = 'delivered'
      AND oi.product_id = ?
    LIMIT 1
  `;

  db.query(purchaseSql, [userId, product_id], (purchaseErr, purchaseResult) => {
    if (purchaseErr) {
      console.error("Check delivered order error:", purchaseErr);

      return res.status(500).json({
        message: "Failed to verify order",
        error: purchaseErr.message,
      });
    }

    if (!purchaseResult || purchaseResult.length === 0) {
      return res.status(403).json({
        message: "You can review a product only after it is delivered",
      });
    }

    // ===============================
    // CHECK EXISTING REVIEW
    // ===============================

    const existingSql = `
        SELECT id
        FROM reviews
        WHERE user_id = ?
          AND product_id = ?
        LIMIT 1
      `;

    db.query(
      existingSql,
      [userId, product_id],
      (existingErr, existingResult) => {
        if (existingErr) {
          console.error("Check existing review error:", existingErr);

          return res.status(500).json({
            message: "Failed to check existing review",
            error: existingErr.message,
          });
        }

        if (existingResult && existingResult.length > 0) {
          return res.status(409).json({
            message: "You have already reviewed this product",
          });
        }

        // ===============================
        // INSERT REVIEW
        // ===============================

        const insertSql = `
            INSERT INTO reviews
            (
              user_id,
              product_id,
              rating,
              comment
            )
            VALUES (?, ?, ?, ?)
          `;

        db.query(
          insertSql,
          [userId, product_id, numericRating, comment?.trim() || null],
          (insertErr, result) => {
            if (insertErr) {
              console.error("Create review error:", insertErr);

              return res.status(500).json({
                message: "Failed to submit review",
                error: insertErr.message,
              });
            }

            return res.status(201).json({
              success: true,
              reviewId: result.insertId,
              message: "Review submitted successfully",
            });
          }
        );
      }
    );
  });
};

// ===============================
// CHECK IF USER REVIEWED PRODUCT
// ===============================
const checkUserReview = (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const sql = `
    SELECT
      id,
      rating,
      comment,
      is_verified,
      created_at
    FROM reviews
    WHERE user_id = ?
      AND product_id = ?
    LIMIT 1
  `;

  db.query(sql, [userId, productId], (err, results) => {
    if (err) {
      console.error("Check user review error:", err);

      return res.status(500).json({
        message: "Failed to check review",
        error: err.message,
      });
    }

    return res.json({
      reviewed: results.length > 0,
      review: results.length > 0 ? results[0] : null,
    });
  });
};

const updateProductRating = (productId, callback) => {
  const sql = `
    UPDATE products p
    SET p.rating = COALESCE(
      (
        SELECT ROUND(AVG(r.rating), 1)
        FROM reviews r
        WHERE r.product_id = ?
          AND r.is_verified = 1
      ),
      0
    )
    WHERE p.id = ?
  `;

  db.query(sql, [productId, productId], (err) => {
    if (err) {
      console.error("Update product rating error:", err);
      return callback(err);
    }

    callback(null);
  });
};

module.exports = {
  getAllReviews,
  updateReviewVerification,
  deleteReview,
  createReview,
  checkUserReview,
};
