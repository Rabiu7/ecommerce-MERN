const db = require("../config/database");

exports.getReviews = (req, res) => {
  const sql = `
      SELECT
      users.name,
      products.name AS product_name,
      reviews.rating,
      reviews.comment
      FROM reviews
      JOIN users
      ON reviews.user_id = users.id
      JOIN products
      ON reviews.product_id = products.id
      ORDER BY reviews.created_at DESC
      LIMIT 6
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};
