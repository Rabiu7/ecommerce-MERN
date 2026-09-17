const db = require("../config/database");

const Product = {
  // =========================================================
  // GET ALL PRODUCTS
  // =========================================================

  getAll: (callback) => {
    const sql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.discount,
        p.stock,
        p.image,
        p.rating,
        p.category_id AS category_id,
        c.name AS category
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `;

    db.query(sql, callback);
  },

  // =========================================================
  // GET SINGLE PRODUCT
  // =========================================================

  getById: (id, callback) => {
    const sql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.discount,
        p.stock,
        p.image,
        p.rating,
        p.category_id AS category_id,
        c.name AS category
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      WHERE p.id = ?
    `;

    db.query(sql, [id], callback);
  },

  // =========================================================
  // CREATE PRODUCT
  // =========================================================

  create: (product, callback) => {
    const sql = `
      INSERT INTO products
      (
        category_id,
        name,
        description,
        price,
        discount,
        stock,
        image
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        product.category_id,
        product.name,
        product.description,
        product.price,
        product.discount,
        product.stock,
        product.image,
      ],
      callback
    );
  },

  // =========================================================
  // UPDATE PRODUCT
  // =========================================================

  update: (id, product, callback) => {
    const sql = `
      UPDATE products
      SET
        category_id = ?,
        name = ?,
        description = ?,
        price = ?,
        discount = ?,
        stock = ?,
        image = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        product.category_id,
        product.name,
        product.description,
        product.price,
        product.discount,
        product.stock,
        product.image,
        id,
      ],
      callback
    );
  },

  // =========================================================
  // UPDATE STOCK
  // =========================================================

  updateStock: (id, stock, callback) => {
    const sql = `
      UPDATE products
      SET stock = ?
      WHERE id = ?
    `;

    db.query(sql, [stock, id], callback);
  },

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  delete: (id, callback) => {
    const sql = `
      DELETE FROM products
      WHERE id = ?
    `;

    db.query(sql, [id], callback);
  },
};

module.exports = Product;
