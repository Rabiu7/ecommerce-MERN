const db = require("../config/database");

// =========================================================
// GET ALL CATEGORIES
// =========================================================

exports.getAll = (callback) => {
  const sql = ` 
    SELECT
      c.id,
      c.name,
      c.image,
      c.created_at,
      COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p
      ON p.category_id = c.id
    GROUP BY
      c.id,
      c.name,
      c.image,
      c.created_at
    ORDER BY c.created_at DESC
  `;

  db.query(sql, callback);
};

// =========================================================
// GET CATEGORY BY ID
// =========================================================

exports.getById = (id, callback) => {
  const sql = `
    SELECT
      id,
      name,
      description,
      image,
      created_at
    FROM categories
    WHERE id = ?
  `;

  db.query(sql, [id], callback);
};

// =========================================================
// CREATE CATEGORY
// =========================================================

exports.create = (category, callback) => {
  const sql = `
    INSERT INTO categories
    (
      name,
      description,
      image
    )
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [category.name, category.description, category.image],
    callback,
  );
};

// =========================================================
// UPDATE CATEGORY
// =========================================================

exports.update = (id, category, callback) => {
  const sql = `
    UPDATE categories
    SET
      name = ?,
      description = ?,
      image = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [category.name, category.description, category.image, id],
    callback,
  );
};

// =========================================================
// DELETE CATEGORY
// =========================================================

exports.delete = (id, callback) => {
  const sql = `
    DELETE FROM categories
    WHERE id = ?
  `;

  db.query(sql, [id], callback);
};

// =========================================================
// PRODUCT COUNT
// =========================================================

exports.getProductCount = (id, callback) => {
  const sql = `
    SELECT COUNT(*) AS count
    FROM products
    WHERE category_id = ?
  `;

  db.query(sql, [id], callback);
};
