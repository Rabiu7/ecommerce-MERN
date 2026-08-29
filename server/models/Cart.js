const db = require("../config/database");

const Cart = {
  getCart: (userId, callback) => {
    const sql = `
      SELECT
        c.id,
        c.quantity,
        p.id AS product_id,
        p.name,
        p.price,
        p.image
      FROM cart c
      JOIN products p
        ON c.product_id = p.id
      WHERE c.user_id = ?
    `;

    db.query(sql, [userId], callback);
  },

  addToCart: (userId, productId, callback) => {
    const checkSql = "SELECT * FROM cart WHERE user_id=? AND product_id=?";

    db.query(checkSql, [userId, productId], (err, result) => {
      if (err) return callback(err);

      if (result.length > 0) {
        const updateSql =
          "UPDATE cart SET quantity = quantity + 1 WHERE user_id=? AND product_id=?";

        db.query(updateSql, [userId, productId], callback);
      } else {
        const insertSql =
          "INSERT INTO cart(user_id,product_id,quantity) VALUES(?,?,1)";

        db.query(insertSql, [userId, productId], callback);
      }
    });
  },

  updateQuantity: (id, quantity, callback) => {
    db.query("UPDATE cart SET quantity=? WHERE id=?", [quantity, id], callback);
  },

  removeItem: (id, callback) => {
    db.query("DELETE FROM cart WHERE id=?", [id], callback);
  },
};

module.exports = Cart;
