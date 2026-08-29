const db = require("../config/database");

const Product = {
  // Get all products

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
      p.category_id as category_id,
      c.name AS category
    FROM products p
    LEFT JOIN categories c
      ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `;

    db.query(sql, callback);
  },

  // Get single product

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
      p.category_id as category_id,
      c.name AS category
    FROM products p
    LEFT JOIN categories c
      ON p.category_id = c.id
    WHERE p.id = ?
  `;

    db.query(sql, [id], callback);
  },

  // Create product

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

        VALUES (?,?,?,?,?,?,?)

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

  // Delete product

  delete: (id, callback) => {
    const sql = `

        DELETE FROM products

        WHERE id = ?

        `;

    db.query(
      sql,

      [id],

      callback,
    );
  },
};

module.exports = Product;
