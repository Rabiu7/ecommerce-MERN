const db = require("../config/database");

const Product = {
  // =========================================================
  // GET ALL PRODUCTS
  // =========================================================

  getAll: (callback) => {
    const sql = `
      SELECT
        p.id,
        p.public_id,
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
        p.public_id,
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

  // =========================================================
  // GET PAGINATED PRODUCT COUNT
  // =========================================================

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

  // =========================================================
  // GET SINGLE PRODUCT BY PUBLIC ID
  // =========================================================

  getByPublicId: (publicId, callback) => {
    const sql = `
      SELECT
        p.id,
        p.public_id,
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
      WHERE p.public_id = ?
      LIMIT 1
    `;

    db.query(sql, [publicId], callback);
  },

  // =========================================================
  // GET RELATED PRODUCT COUNT BY PUBLIC ID
  // =========================================================

  getRelatedCount: (publicId, callback) => {
    const sql = `
      SELECT COUNT(*) AS total
      FROM products
      WHERE category_id = (
        SELECT category_id
        FROM products
        WHERE public_id = ?
        LIMIT 1
      )
      AND public_id != ?
    `;

    db.query(sql, [publicId, publicId], callback);
  },

  // =========================================================
  // GET RELATED PRODUCTS PAGINATED BY PUBLIC ID
  // =========================================================

  getRelatedPaginated: (publicId, limit, offset, callback) => {
    const sql = `
      SELECT
        p.id,
        p.public_id,
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
        WHERE public_id = ?
        LIMIT 1
      )
      AND p.public_id != ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    db.query(sql, [publicId, publicId, limit, offset], callback);
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

  // =========================================================
  // CREATE PRODUCT
  // =========================================================

  create: (product, callback) => {
    const sql = `
      INSERT INTO products
      (
        public_id,
        category_id,
        name,
        description,
        price,
        discount,
        stock,
        image
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        product.public_id,
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
  // UPDATE PRODUCT
  // =========================================================

  update: (id, product, callback) => {
    const sql = `
      UPDATE products
      SET
        name = ?,
        description = ?,
        category_id = ?,
        price = ?,
        discount = ?,
        stock = ?,
        image = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        product.name,
        product.description,
        product.category_id,
        product.price,
        product.discount,
        product.stock,
        product.image,
        id,
      ],
      callback,
    );
  },

  // =========================================================
  // UPDATE PRODUCT STOCK
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
