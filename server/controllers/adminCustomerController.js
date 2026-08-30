const User = require("../models/User");

// =========================================================
// GET ALL CUSTOMERS
// GET /api/admin/customers
// =========================================================

exports.getAllCustomers = (req, res) => {
  User.getAllCustomers((err, customers) => {
    if (err) {
      console.error("Admin Get Customers Error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch customers",
      });
    }

    return res.json({
      success: true,
      customers,
    });
  });
};

// =========================================================
// GET SINGLE CUSTOMER
// GET /api/admin/customers/:id
// =========================================================

exports.getCustomer = (req, res) => {
  const customerId = req.params.id;

  User.getCustomerById(customerId, (err, customers) => {
    if (err) {
      console.error("Admin Get Customer Error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch customer",
      });
    }

    if (!customers || customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      customer: customers[0],
    });
  });
};

// =========================================================
// GET CUSTOMER ORDERS
// GET /api/admin/customers/:id/orders
// =========================================================

exports.getCustomerOrders = (req, res) => {
  const customerId = req.params.id;

  User.getCustomerOrders(customerId, (err, orders) => {
    if (err) {
      console.error("Admin Get Customer Orders Error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch customer orders",
      });
    }

    return res.json({
      success: true,
      orders,
    });
  });
};
