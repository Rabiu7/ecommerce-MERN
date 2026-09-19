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
  // GET PAGINATED PRODUCTS
  // =========================================================

  getPaginated: (limit, offset, search, category, sort, callback) => {
    let sql = `
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
    WHERE 1 = 1
  `;

    const params = [];

    if (search) {
      sql += ` AND p.name LIKE ?`;
      params.push(`%${search}%`);
    }

    if (category && category !== "All") {
      sql += ` AND c.name = ?`;
      params.push(category);
    }

    if (sort === "low") {
      sql += ` ORDER BY p.price ASC`;
    } else if (sort === "high") {
      sql += ` ORDER BY p.price DESC`;
    } else if (sort === "rating") {
      sql += ` ORDER BY p.rating DESC`;
    } else {
      sql += ` ORDER BY p.created_at DESC`;
    }

    sql += ` LIMIT ? OFFSET ?`;

    params.push(limit, offset);

    db.query(sql, params, callback);
  },

  getPaginatedCount: (search, category, callback) => {
    let sql = `
    SELECT COUNT(*) AS total
    FROM products p
    LEFT JOIN categories c
      ON p.category_id = c.id
    WHERE 1 = 1
  `;

    const params = [];

    if (search) {
      sql += ` AND p.name LIKE ?`;
      params.push(`%${search}%`);
    }

    if (category && category !== "All") {
      sql += ` AND c.name = ?`;
      params.push(category);
    }

    db.query(sql, params, callback);
  },

  getRelated: (productId, limit, callback) => {
    const sql = `
    SELECT
      p2.id,
      p2.name,
      p2.description,
      p2.price,
      p2.discount,
      p2.stock,
      p2.image,
      p2.rating,
      p2.category_id AS category_id,
      c.name AS category
    FROM products p1
    INNER JOIN products p2
      ON p2.category_id = p1.category_id
      AND p2.id != p1.id
    LEFT JOIN categories c
      ON p2.category_id = c.id
    WHERE p1.id = ?
    ORDER BY p2.created_at DESC
    LIMIT ?
  `;

    db.query(sql, [productId, limit], callback);
  },

  // =========================================================
  // GET TOTAL PRODUCT COUNT
  // =========================================================

  getCount: (callback) => {
    const sql = `
      SELECT COUNT(*) AS total
      FROM products
    `;

    db.query(sql, callback);
  },

  getRelatedCount: (productId, callback) => {
    const sql = `
    SELECT COUNT(*) AS total
    FROM products
    WHERE category_id = (
      SELECT category_id
      FROM products
      WHERE id = ?
    )
    AND id != ?
  `;

    db.query(sql, [productId, productId], callback);
  },

  getRelatedPaginated: (productId, limit, offset, callback) => {
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
    WHERE p.category_id = (
      SELECT category_id
      FROM products
      WHERE id = ?
    )
    AND p.id != ?
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;

    db.query(sql, [productId, productId, limit, offset], callback);
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
      callback,
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
  // UPDATE PRICE / DISCOUNT / STOCK
  // =========================================================

  update: (id, product, callback) => {
    const sql = `
      UPDATE products
      SET
        price = ?,
        discount = ?,
        stock = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [product.price, product.discount, product.stock, id],
      callback,
    );
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
