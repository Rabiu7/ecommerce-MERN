const db = require("../config/database");

const Wishlist = {
  // Get wishlist with product details
  getByUserId: (userId, callback) => {
    const sql = `
      SELECT
        w.id,
        w.user_id,
        w.product_id,
        w.created_at,
        p.*
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `;

    db.query(sql, [userId], callback);
  },

  // Add product to wishlist
  add: (userId, productId, callback) => {
    const sql = `
      INSERT INTO wishlist (user_id, product_id)
      VALUES (?, ?)
    `;

    db.query(sql, [userId, productId], callback);
  },

  // Remove product from wishlist
  remove: (userId, productId, callback) => {
    const sql = `
      DELETE FROM wishlist
      WHERE user_id = ? AND product_id = ?
    `;

    db.query(sql, [userId, productId], callback);
  },

  // Check whether product is already in wishlist
  exists: (userId, productId, callback) => {
    const sql = `
      SELECT id
      FROM wishlist
      WHERE user_id = ? AND product_id = ?
      LIMIT 1
    `;

    db.query(sql, [userId, productId], callback);
  },
};

module.exports = Wishlist;
