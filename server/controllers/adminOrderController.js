const Order = require("../models/Order");

// =========================================================
// GET ALL ORDERS
// GET /api/admin/orders
//
// Example:
// /api/admin/orders?page=1&limit=10&search=&status=all
// =========================================================

exports.getAllOrders = (req, res) => {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;

  const search = (req.query.search || "").trim();
  const status = (req.query.status || "all").trim();

  // ---------------------------------------------------------
  // Validate page
  // ---------------------------------------------------------

  if (page < 1) {
    page = 1;
  }

  // ---------------------------------------------------------
  // Validate limit
  // ---------------------------------------------------------

  if (limit < 1) {
    limit = 10;
  }

  // Maximum 50 orders per request
  if (limit > 50) {
    limit = 50;
  }

  // ---------------------------------------------------------
  // Allowed statuses
  // ---------------------------------------------------------

  const allowedStatuses = [
    "all",
    "pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Failed",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  // ---------------------------------------------------------
  // Get total count
  // ---------------------------------------------------------

  Order.getOrdersCount(search, status, (countError, countResult) => {
    if (countError) {
      console.error("Admin Get Orders Count Error:", countError);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch order count",
      });
    }

    const totalOrders = Number(countResult[0].total);

    const totalPages = totalOrders === 0 ? 0 : Math.ceil(totalOrders / limit);

    // -------------------------------------------------------
    // If requested page does not exist
    // -------------------------------------------------------

    if (totalPages > 0 && page > totalPages) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    // -------------------------------------------------------
    // Get paginated orders
    // -------------------------------------------------------

    Order.getAllOrders(page, limit, search, status, (ordersError, orders) => {
      if (ordersError) {
        console.error("Admin Get Orders Error:", ordersError);

        return res.status(500).json({
          success: false,
          message: "Failed to fetch orders",
        });
      }

      // ---------------------------------------------------
      // Format shipping address
      // ---------------------------------------------------

      const formattedOrders = orders.map((order) => {
        let shippingAddress = order.shipping_address;

        if (typeof shippingAddress === "string") {
          try {
            shippingAddress = JSON.parse(shippingAddress);
          } catch {
            shippingAddress = {};
          }
        }

        return {
          ...order,
          shipping_address: shippingAddress,
        };
      });

      // ---------------------------------------------------
      // Get status summary counts
      // ---------------------------------------------------

      Order.getOrderStatusCounts((statusError, statusResult) => {
        if (statusError) {
          console.error("Admin Order Status Counts Error:", statusError);

          return res.status(500).json({
            success: false,
            message: "Failed to fetch order status counts",
          });
        }

        const counts = statusResult[0] || {};

        return res.json({
          success: true,

          orders: formattedOrders,

          pagination: {
            currentPage: page,
            limit,
            totalOrders,
            totalPages,

            hasNextPage: page < totalPages,

            hasPreviousPage: page > 1,
          },

          statusCounts: {
            all: Number(counts.all_count) || 0,
            pending: Number(counts.pending_count) || 0,
            confirmed: Number(counts.confirmed_count) || 0,
            processing: Number(counts.processing_count) || 0,
            shipped: Number(counts.shipped_count) || 0,
            delivered: Number(counts.delivered_count) || 0,
            cancelled: Number(counts.cancelled_count) || 0,
            failed: Number(counts.failed_count) || 0,
          },
        });
      });
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
