const db = require("../config/database");

// =========================================================
// ADD STOCK REMINDER
// =========================================================

exports.addReminder = (req, res) => {
  const { user_id, product_id } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({
      message: "User ID and product ID are required.",
    });
  }

  // Check whether product exists
  const productSql = `
    SELECT id, name, stock
    FROM products
    WHERE id = ?
    LIMIT 1
  `;

  db.query(productSql, [product_id], (productError, products) => {
    if (productError) {
      console.error("Product check error:", productError);

      return res.status(500).json({
        message: "Unable to check product.",
      });
    }

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    // Product is already available
    if (Number(products[0].stock) > 0) {
      return res.status(400).json({
        message: "This product is already in stock.",
      });
    }

    // Check existing reminder
    const checkSql = `
      SELECT id, notified
      FROM stock_reminders
      WHERE user_id = ?
      AND product_id = ?
      LIMIT 1
    `;

    db.query(checkSql, [user_id, product_id], (checkError, existing) => {
      if (checkError) {
        console.error("Reminder check error:", checkError);

        return res.status(500).json({
          message: "Unable to check reminder.",
        });
      }

      if (existing.length > 0) {
        const existingReminder = existing[0];

        // Already waiting for this product
        if (Number(existingReminder.notified) === 0) {
          return res.status(200).json({
            message: "You are already subscribed for this product.",
          });
        }

        // Previous notification was already sent.
        // Reset the same reminder for the next restock.
        const resetSql = `
    UPDATE stock_reminders
    SET
      notified = 0,
      notified_at = NULL,
      created_at = NOW()
    WHERE id = ?
  `;

        return db.query(resetSql, [existingReminder.id], (resetError) => {
          if (resetError) {
            console.error("Reset stock reminder error:", resetError);

            return res.status(500).json({
              message: "Failed to set stock reminder.",
            });
          }

          return res.status(200).json({
            message: "We'll remind you when this product is back in stock.",
          });
        });
      }

      // No previous reminder exists → create one
      const insertSql = `
  INSERT INTO stock_reminders
  (
    user_id,
    product_id,
    notified
  )
  VALUES (?, ?, 0)
`;

      db.query(insertSql, [user_id, product_id], (insertError) => {
        if (insertError) {
          console.error("Add stock reminder error:", insertError);

          return res.status(500).json({
            message: "Failed to set stock reminder.",
          });
        }

        res.status(201).json({
          message: "We'll remind you when this product is back in stock.",
        });
      });
    });
  });
};

// =========================================================
// CHECK WHETHER USER HAS A REMINDER FOR A PRODUCT
// =========================================================

exports.checkReminder = (req, res) => {
  const { userId, productId } = req.params;

  const sql = `
      SELECT
        id,
        notified
      FROM stock_reminders
      WHERE user_id = ?
      AND product_id = ?
      LIMIT 1
    `;

  db.query(sql, [userId, productId], (err, result) => {
    if (err) {
      console.error("Check reminder error:", err);

      return res.status(500).json({
        message: "Unable to check reminder.",
      });
    }

    res.json({
      subscribed: result.length > 0 && Number(result[0].notified) === 0,
      notified: result.length > 0 ? Number(result[0].notified) === 1 : false,
    });
  });
};

// =========================================================
// GET USER REMINDERS
// =========================================================

exports.getUserReminders = (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      sr.id,
      sr.product_id,
      sr.notified,
      sr.created_at,
      sr.notified_at,

      p.name AS product_name,
      p.image,
      p.stock

    FROM stock_reminders sr

    INNER JOIN products p
      ON p.id = sr.product_id

    WHERE sr.user_id = ?

    ORDER BY sr.created_at DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Get reminders error:", err);

      return res.status(500).json({
        message: "Unable to fetch reminders.",
      });
    }

    res.json(result);
  });
};

// =========================================================
// DELETE STOCK REMINDER
// =========================================================

exports.deleteReminder = (req, res) => {
  const { userId, productId } = req.params;

  const sql = `
    DELETE FROM stock_reminders
    WHERE user_id = ?
    AND product_id = ?
  `;

  db.query(sql, [userId, productId], (err, result) => {
    if (err) {
      console.error("Delete reminder error:", err);

      return res.status(500).json({
        message: "Unable to cancel reminder.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Reminder not found.",
      });
    }

    res.json({
      message: "Stock reminder cancelled.",
    });
  });
};
