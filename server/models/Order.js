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
    const sql = `
      INSERT INTO orders
      (
        user_id,
        is_buy_now,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        shipping_address
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        userId,
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

  markPaymentSuccessful(orderId, cashfreePaymentId, callback) {
    const sql = `
      UPDATE orders
      SET
        cashfree_payment_id = ?,
        payment_status = 'paid',
        order_status = 'Confirmed'
      WHERE id = ?
      AND payment_status = 'pending'
    `;

    db.query(sql, [cashfreePaymentId, orderId], callback);
  },

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
  // GET USER ORDERS
  // =========================================================

  getOrders(userId, callback) {
    const sql = `
      SELECT *
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], callback);
  },

  // =========================================================
  // ADMIN - GET ALL ORDERS
  // =========================================================

  getAllOrders(callback) {
    const sql = `
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

      ORDER BY o.created_at DESC
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
