const Order = require("../models/Order");

// =========================================================
// GET ALL ORDERS
// GET /api/admin/orders
// =========================================================

exports.getAllOrders = (req, res) => {
  Order.getAllOrders((err, orders) => {
    if (err) {
      console.error("Admin Get Orders Error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }

    const formattedOrders = orders.map((order) => ({
      ...order,

      shipping_address:
        typeof order.shipping_address === "string"
          ? JSON.parse(order.shipping_address)
          : order.shipping_address,
    }));

    return res.json({
      success: true,
      orders: formattedOrders,
    });
  });
};

// =========================================================
// GET SINGLE ORDER
// GET /api/admin/orders/:id
// =========================================================

exports.getAdminOrder = (req, res) => {
  const orderId = req.params.id;

  Order.getAdminOrderById(orderId, (err, orders) => {
    if (err) {
      console.error("Admin Get Order Error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch order",
      });
    }

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders[0];

    Order.getOrderItems(orderId, (itemErr, items) => {
      if (itemErr) {
        console.error("Admin Get Order Items Error:", itemErr);

        return res.status(500).json({
          success: false,
          message: "Failed to fetch order items",
        });
      }

      if (typeof order.shipping_address === "string") {
        try {
          order.shipping_address = JSON.parse(order.shipping_address);
        } catch {
          order.shipping_address = {};
        }
      }

      return res.json({
        success: true,

        order: {
          ...order,
          items: items || [],
        },
      });
    });
  });
};

// =========================================================
// UPDATE ORDER STATUS
// PUT /api/admin/orders/:id/status
// =========================================================

exports.updateOrderStatus = (req, res) => {
  const orderId = req.params.id;

  const { order_status } = req.body;

  const allowedStatuses = [
    "pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Failed",
  ];

  if (!allowedStatuses.includes(order_status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  Order.updateOrderStatus(orderId, order_status, (err, result) => {
    if (err) {
      console.error("Update Order Status Error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to update order status",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      message: "Order status updated successfully",
      orderId,
      order_status,
    });
  });
};
