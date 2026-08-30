const db = require("../config/database");

const User = {
  // =========================================================
  // ADMIN - GET ALL CUSTOMERS
  // =========================================================

  getAllCustomers(callback) {
    const sql = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.created_at,

        COUNT(o.id) AS total_orders,

        COALESCE(SUM(o.total_amount), 0) AS total_spent

      FROM users u

      LEFT JOIN orders o
        ON o.user_id = u.id

      WHERE u.role = 'customer'

      GROUP BY
        u.id,
        u.name,
        u.email,
        u.phone,
        u.created_at

      ORDER BY u.created_at DESC
    `;

    db.query(sql, callback);
  },

  // =========================================================
  // ADMIN - GET CUSTOMER BY ID
  // =========================================================

  getCustomerById(customerId, callback) {
    const sql = `
      SELECT
        id,
        name,
        email,
        phone,
        created_at

      FROM users

      WHERE id = ?
      AND role = 'customer'

      LIMIT 1
    `;

    db.query(sql, [customerId], callback);
  },

  // =========================================================
  // ADMIN - GET CUSTOMER ORDERS
  // =========================================================

  getCustomerOrders(customerId, callback) {
    const sql = `
      SELECT
        id,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        shipping_address,
        created_at

      FROM orders

      WHERE user_id = ?

      ORDER BY created_at DESC
    `;

    db.query(sql, [customerId], callback);
  },

  // =========================================================
  // FIND USER BY EMAIL
  // =========================================================

  findByEmail(email, callback) {
    const sql = `
    SELECT
      id,
      name,
      email,
      phone,
      password,
      role,
      created_at
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

    db.query(sql, [email], callback);
  },

  // =========================================================
  // CREATE USER
  // =========================================================

  create(user, callback) {
    const sql = `
    INSERT INTO users
    (
      name,
      email,
      phone,
      password
    )
    VALUES (?, ?, ?, ?)
  `;

    db.query(sql, [user.name, user.email, user.phone, user.password], callback);
  },
};

module.exports = User;
