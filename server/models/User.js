const db = require("../config/database");

const User = {
  // =========================================================
  // ADMIN - GET ALL CUSTOMERS
  // =========================================================

  // =========================================================
  // ADMIN - GET CUSTOMERS PAGINATED
  // =========================================================

  getCustomersPaginated(page, limit, search, callback) {
    const offset = (page - 1) * limit;

    let sql = `
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
  `;

    const params = [];

    // ---------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------

    if (search) {
      sql += `
      AND (
        u.name LIKE ?
        OR u.email LIKE ?
        OR u.phone LIKE ?
      )
    `;

      const searchValue = `%${search}%`;

      params.push(searchValue, searchValue, searchValue);
    }

    // ---------------------------------------------------------
    // GROUP + PAGINATION
    // ---------------------------------------------------------

    sql += `
    GROUP BY
      u.id,
      u.name,
      u.email,
      u.phone,
      u.created_at

    ORDER BY u.created_at DESC

    LIMIT ? OFFSET ?
  `;

    params.push(limit, offset);

    db.query(sql, params, callback);
  },

  // =========================================================
  // ADMIN - GET CUSTOMER COUNT
  // =========================================================

  getCustomersCount(search, callback) {
    let sql = `
    SELECT COUNT(*) AS total
    FROM users u

    WHERE u.role = 'customer'
  `;

    const params = [];

    // ---------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------

    if (search) {
      sql += `
      AND (
        u.name LIKE ?
        OR u.email LIKE ?
        OR u.phone LIKE ?
      )
    `;

      const searchValue = `%${search}%`;

      params.push(searchValue, searchValue, searchValue);
    }

    db.query(sql, params, callback);
  },

  // =========================================================
  // ADMIN - CUSTOMERS WITH ORDERS COUNT
  // =========================================================

  getCustomersWithOrdersCount(search, callback) {
    let sql = `
    SELECT COUNT(DISTINCT u.id) AS total

    FROM users u

    INNER JOIN orders o
      ON o.user_id = u.id

    WHERE u.role = 'customer'
  `;

    const params = [];

    // ---------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------

    if (search) {
      sql += `
      AND (
        u.name LIKE ?
        OR u.email LIKE ?
        OR u.phone LIKE ?
      )
    `;

      const searchValue = `%${search}%`;

      params.push(searchValue, searchValue, searchValue);
    }

    db.query(sql, params, callback);
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
      o.id AS order_id,
      o.public_order_id,
      o.total_amount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.shipping_address,
      o.created_at,

      oi.product_id,
      oi.quantity,
      oi.price,

      p.name AS product_name,
      p.image AS product_image

    FROM orders o

    LEFT JOIN order_items oi
      ON oi.order_id = o.id

    LEFT JOIN products p
      ON p.id = oi.product_id

    WHERE o.user_id = ?

    ORDER BY o.created_at DESC, oi.id ASC
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
