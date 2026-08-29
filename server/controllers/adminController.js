const db = require("../config/database");

exports.getDashboardStats = (req, res) => {
  const queries = {
    users: "SELECT COUNT(*) AS total FROM users",

    products: "SELECT COUNT(*) AS total FROM products",

    orders: "SELECT COUNT(*) AS total FROM orders",

    revenue: `
      SELECT COALESCE(SUM(total_amount), 0) AS total
      FROM orders
      WHERE payment_status = 'paid'
    `,

    pendingOrders: `
      SELECT COUNT(*) AS total
      FROM orders
      WHERE order_status = 'pending'
    `,
  };

  const stats = {};

  db.query(queries.users, (err, usersResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to load dashboard statistics",
      });
    }

    stats.users = usersResult[0].total;

    db.query(queries.products, (err, productsResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Failed to load dashboard statistics",
        });
      }

      stats.products = productsResult[0].total;

      db.query(queries.orders, (err, ordersResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "Failed to load dashboard statistics",
          });
        }

        stats.orders = ordersResult[0].total;

        db.query(queries.revenue, (err, revenueResult) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              message: "Failed to load dashboard statistics",
            });
          }

          stats.revenue = revenueResult[0].total;

          db.query(queries.pendingOrders, (err, pendingResult) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                message: "Failed to load dashboard statistics",
              });
            }

            stats.pendingOrders = pendingResult[0].total;

            res.json(stats);
          });
        });
      });
    });
  });
};
