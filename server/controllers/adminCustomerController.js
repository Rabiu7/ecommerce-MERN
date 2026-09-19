const User = require("../models/User");

// =========================================================
// GET ALL CUSTOMERS
// GET /api/admin/customers
// =========================================================

exports.getAllCustomers = (req, res) => {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;

  const search = (req.query.search || "").trim();

  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 10;
  }

  if (limit > 50) {
    limit = 50;
  }

  User.getCustomersCount(search, (countError, countResult) => {
    if (countError) {
      console.error("Admin Get Customers Count Error:", countError);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch customer count",
      });
    }

    const totalCustomers = Number(countResult[0].total) || 0;

    const totalPages =
      totalCustomers === 0 ? 0 : Math.ceil(totalCustomers / limit);

    if (totalPages > 0 && page > totalPages) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    User.getCustomersPaginated(
      page,
      limit,
      search,
      (customersError, customers) => {
        if (customersError) {
          console.error(
            "Admin Get Customers Pagination Error:",
            customersError,
          );

          return res.status(500).json({
            success: false,
            message: "Failed to fetch customers",
          });
        }

        User.getCustomersWithOrdersCount(
          search,
          (ordersCountError, ordersCountResult) => {
            if (ordersCountError) {
              console.error(
                "Admin Get Customers With Orders Count Error:",
                ordersCountError,
              );

              return res.status(500).json({
                success: false,
                message: "Failed to fetch customer summary",
              });
            }

            const customersWithOrders = Number(ordersCountResult[0].total) || 0;

            return res.json({
              success: true,

              customers,

              pagination: {
                currentPage: page,
                limit,
                totalCustomers,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
              },

              summary: {
                totalCustomers,
                customersWithOrders,
              },
            });
          },
        );
      },
    );
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

  User.getCustomerOrders(customerId, (err, rows) => {
    if (err) {
      console.error("Admin Get Customer Orders Error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch customer orders",
      });
    }

    const ordersMap = new Map();

    rows.forEach((row) => {
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          id: row.order_id,
          public_order_id: row.public_order_id,
          total_amount: row.total_amount,
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          order_status: row.order_status,
          shipping_address:
            typeof row.shipping_address === "string"
              ? JSON.parse(row.shipping_address)
              : row.shipping_address,
          created_at: row.created_at,
          items: [],
        });
      }

      if (row.product_id) {
        ordersMap.get(row.order_id).items.push({
          product_id: row.product_id,
          product_name: row.product_name,
          product_image: row.product_image,
          quantity: row.quantity,
          price: row.price,
        });
      }
    });

    const orders = Array.from(ordersMap.values());

    return res.json({
      success: true,
      orders,
    });
  });
};
