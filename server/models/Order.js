const db = require("../config/database");
const crypto = require("crypto");

const Order = {
  // =========================================================
  // CREATE ORDER
  // =========================================================

  createOrder(
    userId,
    totalAmount,
    paymentMethod,
    paymentStatus,
    orderStatus,
    shippingAddress,
    isBuyNow,
    callback,
  ) {
    const publicOrderId = `MAC-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const sql = `
    INSERT INTO orders
    (
      user_id,
      public_order_id,
      is_buy_now,
      total_amount,
      payment_method,
      payment_status,
      order_status,
      shipping_address
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

    db.query(
      sql,
      [
        userId,
        publicOrderId,
        isBuyNow ? 1 : 0,
        totalAmount,
        paymentMethod,
        paymentStatus,
        orderStatus,
        JSON.stringify(shippingAddress || {}),
      ],
      callback,
    );
  },

  addOrderItem(orderId, productId, quantity, price, callback) {
    const sql = `
      INSERT INTO order_items
      (
        order_id,
        product_id,
        quantity,
        price
      )
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [orderId, productId, quantity, price], callback);
  },

  getCart(userId, callback) {
    const sql = `
      SELECT
        c.product_id,
        c.quantity,
        p.price
      FROM cart c
      JOIN products p
        ON p.id = c.product_id
      WHERE c.user_id = ?
    `;

    db.query(sql, [userId], callback);
  },

  getBuyNowProduct(productId, callback) {
    const sql = `
      SELECT
        id AS product_id,
        price,
        stock
      FROM products
      WHERE id = ?
      LIMIT 1
    `;

    db.query(sql, [productId], callback);
  },

  // =========================================================
  // GET ORDER BY LOCAL ID
  // =========================================================

  // =========================================================
  // GET USER ORDER BY PUBLIC ORDER ID
  // =========================================================

  getOrderByPublicId(publicOrderId, userId, callback) {
    const sql = `
    SELECT *
    FROM orders
    WHERE public_order_id = ?
    AND user_id = ?
    LIMIT 1
  `;

    db.query(sql, [publicOrderId, userId], callback);
  },

  // =========================================================
  // GET ORDER BY CASHFREE ORDER ID
  // =========================================================

  getOrderByCashfreeId(cashfreeOrderId, userId, callback) {
    const sql = `
      SELECT *
      FROM orders
      WHERE cashfree_order_id = ?
      AND user_id = ?
      LIMIT 1
    `;

    db.query(sql, [cashfreeOrderId, userId], callback);
  },

  getOrderById(orderId, userId, callback) {
    const sql = `
    SELECT *
    FROM orders
    WHERE id = ?
    AND user_id = ?
    LIMIT 1
  `;

    db.query(sql, [orderId, userId], callback);
  },

  // =========================================================
  // GET ORDER ITEMS
  // =========================================================

  getOrderItems(orderId, callback) {
    const sql = `
      SELECT
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name,
        p.image
      FROM order_items oi
      LEFT JOIN products p
        ON p.id = oi.product_id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC
    `;

    db.query(sql, [orderId], callback);
  },

  // =========================================================
  // SAVE CASHFREE ORDER ID
  // =========================================================

  saveCashfreeOrderId(orderId, cashfreeOrderId, callback) {
    const sql = `
      UPDATE orders
      SET cashfree_order_id = ?
      WHERE id = ?
    `;

    db.query(sql, [cashfreeOrderId, orderId], callback);
  },

  // =========================================================
  // MARK PAYMENT SUCCESSFUL
  // =========================================================

  // =========================================================
  // MARK PAYMENT SUCCESSFUL
  // =========================================================

  markPaymentSuccessful(orderId, cashfreePaymentId, callback) {
    const sql = `
    UPDATE orders
    SET
      cashfree_payment_id = ?,
      payment_status = 'paid',
      order_status = 'Confirmed'
    WHERE id = ?
    AND payment_status != 'paid'
  `;

    db.query(sql, [cashfreePaymentId, orderId], callback);
  },

  // =========================================================
  // MARK PAYMENT FAILED
  // =========================================================

  // =========================================================
  // MARK PAYMENT FAILED
  // =========================================================

  markPaymentFailed(orderId, callback) {
    const sql = `
    UPDATE orders
    SET
      payment_status = 'failed',
      order_status = 'Failed'
    WHERE id = ?
    AND payment_status != 'paid'
  `;

    db.query(sql, [orderId], callback);
  },

  // =========================================================
  // MARK PAYMENT CANCELLED
  // =========================================================

  markPaymentCancelled(orderId, callback) {
    const sql = `
    UPDATE orders
    SET
      payment_status = 'cancelled',
      order_status = 'Payment Cancelled'
    WHERE id = ?
    AND payment_status != 'paid'
  `;

    db.query(sql, [orderId], callback);
  },

  // =========================================================
  // CLEAR CART
  // =========================================================

  clearCart(userId, callback) {
    const sql = `
      DELETE FROM cart
      WHERE user_id = ?
    `;

    db.query(sql, [userId], callback);
  },

  // =========================================================
  // GET USER ORDERS WITH PAGINATION
  // =========================================================

  getOrdersPaginated(userId, page, limit, search, status, callback) {
    const offset = (page - 1) * limit;

    let sql = `
    SELECT
      o.public_order_id,
      o.total_amount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.created_at

    FROM orders o

    WHERE o.user_id = ?
  `;

    const params = [userId];

    // ---------------------------------------------------------
    // SEARCH BY PUBLIC ORDER ID
    // ---------------------------------------------------------

    if (search) {
      sql += `
      AND o.public_order_id LIKE ?
    `;

      params.push(`%${search}%`);
    }

    // ---------------------------------------------------------
    // STATUS FILTER
    // ---------------------------------------------------------

    if (status && status !== "all") {
      sql += `
      AND LOWER(o.order_status) = LOWER(?)
    `;

      params.push(status);
    }

    // ---------------------------------------------------------
    // PAGINATION
    // ---------------------------------------------------------

    sql += `
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `;

    params.push(limit, offset);

    db.query(sql, params, callback);
  },

  // =========================================================
  // GET USER ORDER COUNT
  // =========================================================

  getUserOrdersCount(userId, search, status, callback) {
    let sql = `
    SELECT COUNT(*) AS total

    FROM orders o

    WHERE o.user_id = ?
  `;

    const params = [userId];

    // ---------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------

    if (search) {
      sql += `
      AND o.public_order_id LIKE ?
    `;

      params.push(`%${search}%`);
    }

    // ---------------------------------------------------------
    // STATUS
    // ---------------------------------------------------------

    if (status && status !== "all") {
      sql += `
      AND LOWER(o.order_status) = LOWER(?)
    `;

      params.push(status);
    }

    db.query(sql, params, callback);
  },

  // =========================================================
  // GET USER ORDER STATUS COUNTS
  // =========================================================

  getUserOrderStatusCounts(userId, callback) {
    const sql = `
    SELECT
      COUNT(*) AS all_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'pending'
          THEN 1 ELSE 0
        END
      ) AS pending_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'processing'
          THEN 1 ELSE 0
        END
      ) AS processing_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'shipped'
          THEN 1 ELSE 0
        END
      ) AS shipped_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'delivered'
          THEN 1 ELSE 0
        END
      ) AS delivered_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'failed'
          THEN 1 ELSE 0
        END
      ) AS failed_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'cancelled'
          THEN 1 ELSE 0
        END
      ) AS cancelled_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'confirmed'
          THEN 1 ELSE 0
        END
      ) AS confirmed_count

    FROM orders

    WHERE user_id = ?
  `;

    db.query(sql, [userId], callback);
  },

  // =========================================================
  // ADMIN - GET ALL ORDERS WITH PAGINATION
  // =========================================================

  getAllOrders(page, limit, search, status, callback) {
    const offset = (page - 1) * limit;

    let sql = `
    SELECT
      o.id,
      o.user_id,
      o.total_amount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.shipping_address,
      o.cashfree_order_id,
      o.cashfree_payment_id,
      o.created_at,

      u.name AS customer_name,
      u.email AS customer_email,
      u.phone AS customer_phone

    FROM orders o

    LEFT JOIN users u
      ON u.id = o.user_id

    WHERE 1 = 1
  `;

    const params = [];

    // Search customer name, email, phone or order ID
    if (search) {
      sql += `
      AND (
        u.name LIKE ?
        OR u.email LIKE ?
        OR u.phone LIKE ?
        OR o.cashfree_order_id LIKE ?
        OR CAST(o.id AS CHAR) LIKE ?
      )
    `;

      const searchValue = `%${search}%`;

      params.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
      );
    }

    // Filter by order status
    if (status && status !== "all") {
      sql += ` AND o.order_status = ?`;
      params.push(status);
    }

    sql += `
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `;

    params.push(limit, offset);

    db.query(sql, params, callback);
  },

  // =========================================================
  // ADMIN - GET ORDER COUNT
  // =========================================================

  getOrdersCount(search, status, callback) {
    let sql = `
    SELECT COUNT(*) AS total

    FROM orders o

    LEFT JOIN users u
      ON u.id = o.user_id

    WHERE 1 = 1
  `;

    const params = [];

    // Same search conditions as getAllOrders()
    if (search) {
      sql += `
      AND (
        u.name LIKE ?
        OR u.email LIKE ?
        OR u.phone LIKE ?
        OR o.cashfree_order_id LIKE ?
        OR CAST(o.id AS CHAR) LIKE ?
      )
    `;

      const searchValue = `%${search}%`;

      params.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
      );
    }

    // Same status condition as getAllOrders()
    if (status && status !== "all") {
      sql += ` AND o.order_status = ?`;
      params.push(status);
    }

    db.query(sql, params, callback);
  },

  // =========================================================
  // ADMIN - GET ORDER STATUS COUNTS
  // =========================================================

  getOrderStatusCounts(callback) {
    const sql = `
    SELECT
      COUNT(*) AS all_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'pending'
          THEN 1 ELSE 0
        END
      ) AS pending_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'confirmed'
          THEN 1 ELSE 0
        END
      ) AS confirmed_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'processing'
          THEN 1 ELSE 0
        END
      ) AS processing_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'shipped'
          THEN 1 ELSE 0
        END
      ) AS shipped_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'delivered'
          THEN 1 ELSE 0
        END
      ) AS delivered_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'cancelled'
          THEN 1 ELSE 0
        END
      ) AS cancelled_count,

      SUM(
        CASE
          WHEN LOWER(order_status) = 'failed'
          THEN 1 ELSE 0
        END
      ) AS failed_count

    FROM orders
  `;

    db.query(sql, callback);
  },

  // =========================================================
  // ADMIN - GET ORDER BY ID
  // =========================================================

  getAdminOrderById(orderId, callback) {
    const sql = `
      SELECT
        o.id,
        o.public_order_id,
        o.user_id,
        o.total_amount,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.shipping_address,
        o.cashfree_order_id,
        o.cashfree_payment_id,
        o.created_at,

        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone

      FROM orders o

      LEFT JOIN users u
        ON u.id = o.user_id

      WHERE o.id = ?

      LIMIT 1
    `;

    db.query(sql, [orderId], callback);
  },

  // =========================================================
  // ADMIN - UPDATE ORDER STATUS
  // =========================================================

  updateOrderStatus(orderId, orderStatus, callback) {
    const sql = `
      UPDATE orders
      SET order_status = ?
      WHERE id = ?
    `;

    db.query(sql, [orderStatus, orderId], callback);
  },
};

module.exports = Order;
