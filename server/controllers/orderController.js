const Order = require("../models/Order");

const CASHFREE_BASE_URL =
  process.env.CASHFREE_BASE_URL || "https://sandbox.cashfree.com/pg";

const CASHFREE_API_VERSION = "2025-01-01";

const PDFDocument = require("pdfkit");

// =========================================================
// CASHFREE HEADERS
// =========================================================

function cashfreeHeaders() {
  return {
    "Content-Type": "application/json",

    "x-client-id": process.env.CASHFREE_APP_ID,

    "x-client-secret": process.env.CASHFREE_SECRET_KEY,

    "x-api-version": CASHFREE_API_VERSION,

    "x-request-id": `HN-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
  };
}

// =========================================================
// PARSE ADDRESS
// =========================================================

function parseShippingAddress(address) {
  if (!address) {
    return {};
  }

  if (typeof address === "object") {
    return address;
  }

  try {
    return JSON.parse(address);
  } catch {
    return {};
  }
}

// =========================================================
// CREATE LOCAL ORDER + ITEMS
// =========================================================

function createLocalOrder(
  userId,
  total,
  paymentMethod,
  paymentStatus,
  orderStatus,
  shippingAddress,
  cart,
  callback,
) {
  Order.createOrder(
    userId,
    total,
    paymentMethod,
    paymentStatus,
    orderStatus,
    shippingAddress,
    (err, result) => {
      if (err) {
        return callback(err);
      }

      const orderId = result.insertId;

      if (!cart || cart.length === 0) {
        return callback(null, orderId);
      }

      let completed = 0;
      let failed = false;

      cart.forEach((item) => {
        Order.addOrderItem(
          orderId,
          item.product_id,
          item.quantity,
          item.price,
          (itemErr) => {
            if (failed) {
              return;
            }

            if (itemErr) {
              failed = true;

              return callback(itemErr);
            }

            completed++;

            if (completed === cart.length) {
              callback(null, orderId);
            }
          },
        );
      });
    },
  );
}

// =========================================================
// GET COMPLETE ORDER
// =========================================================

function getCompleteOrder(orderId, userId, callback) {
  Order.getOrderById(orderId, userId, (err, orders) => {
    if (err) return callback(err);

    if (!orders || orders.length === 0) {
      return callback(null, null);
    }

    const order = orders[0];

    Order.getOrderItems(orderId, (itemErr, items) => {
      if (itemErr) return callback(itemErr);

      callback(null, {
        ...order,
        shipping_address: parseShippingAddress(order.shipping_address),
        items: items || [],
      });
    });
  });
}

// =========================================================
// CHECKOUT
// =========================================================

exports.checkout = async (req, res) => {
  const userId = req.user.id;

  const { payment_method, shipping_address } = req.body;

  // =======================================================
  // VALIDATE
  // =======================================================

  const allowedMethods = ["ONLINE", "COD"];

  if (!allowedMethods.includes(payment_method)) {
    return res.status(400).json({
      message: "Invalid payment method",
    });
  }

  // =======================================================
  // GET CART
  // =======================================================

  Order.getCart(userId, async (err, cart) => {
    if (err) {
      console.error("Get Cart Error:", err);

      return res.status(500).json({
        message: "Failed to get cart",
      });
    }

    if (!cart || cart.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // =====================================================
    // CALCULATE TOTAL
    // =====================================================

    const subtotal = cart.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0,
    );

    const gst = Math.round(subtotal * 0.18 * 100) / 100;

    const shipping = subtotal >= 1000 ? 0 : 99;

    const total = Math.round((subtotal + gst + shipping) * 100) / 100;

    // =====================================================
    // COD
    // =====================================================

    if (payment_method === "COD") {
      return createLocalOrder(
        userId,
        total,
        "COD",
        "pending",
        "Confirmed",
        shipping_address,
        cart,
        (createErr, orderId) => {
          if (createErr) {
            console.error("COD Order Error:", createErr);

            return res.status(500).json({
              message: "Failed to create order",
            });
          }

          Order.clearCart(userId, (clearErr) => {
            if (clearErr) {
              console.error("Clear Cart Error:", clearErr);
            }

            return getCompleteOrder(
              orderId,
              userId,
              (orderErr, completeOrder) => {
                if (orderErr) {
                  return res.status(500).json({
                    message: "Order created but failed to load order",
                  });
                }

                return res.json({
                  success: true,

                  orderId,

                  totalAmount: total,

                  subtotal,

                  gst,

                  shipping,

                  paymentMethod: "COD",

                  paymentStatus: "pending",

                  orderStatus: "Confirmed",

                  shippingAddress: shipping_address,

                  order: completeOrder,

                  message: "Order placed successfully",
                });
              },
            );
          });
        },
      );
    }

    // =====================================================
    // ONLINE PAYMENT
    // =====================================================

    createLocalOrder(
      userId,
      total,
      "ONLINE",
      "pending",
      "pending",
      shipping_address,
      cart,
      async (createErr, orderId) => {
        if (createErr) {
          console.error("Online Order Error:", createErr);

          return res.status(500).json({
            message: "Failed to create payment order",
          });
        }

        try {
          // =================================================
          // CASHFREE ORDER
          // =================================================

          const cashfreeOrderId = `HN_${orderId}_${Date.now()}`;

          const customerId = `USER_${userId}`;

          const customerName =
            shipping_address?.name || req.user?.name || "Customer";

          const customerEmail =
            shipping_address?.email ||
            req.user?.email ||
            "customer@example.com";

          const customerPhone =
            shipping_address?.phone || req.user?.phone || "9999999999";

          const payload = {
            order_id: cashfreeOrderId,

            order_amount: Number(total.toFixed(2)),

            order_currency: "INR",

            customer_details: {
              customer_id: customerId,

              customer_name: customerName,

              customer_email: customerEmail,

              customer_phone: customerPhone,
            },

            order_meta: {
              return_url: `${process.env.FRONTEND_URL}/order-success?order_id={order_id}`,

              notify_url: `${process.env.BACKEND_URL}/api/orders/cashfree/webhook`,
            },

            order_note: `HomeNeeds Order #${orderId}`,
          };

          console.log("Cashfree Create Order Payload:", payload);

          const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
            method: "POST",

            headers: cashfreeHeaders(),

            body: JSON.stringify(payload),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error("Cashfree Create Order Error:", data);

            Order.markPaymentFailed(orderId, () => {});

            return res.status(500).json({
              message: data.message || "Unable to create Cashfree order",
            });
          }

          // =================================================
          // SAVE CASHFREE ORDER ID
          // =================================================

          Order.saveCashfreeOrderId(orderId, data.order_id, (saveErr) => {
            if (saveErr) {
              console.error("Save Cashfree Order ID Error:", saveErr);

              return res.status(500).json({
                message: "Failed to save Cashfree order",
              });
            }

            return res.json({
              success: true,

              orderId,

              cashfreeOrderId: data.order_id,

              paymentSessionId: data.payment_session_id,

              subtotal,

              gst,

              shipping,

              amount: total,

              totalAmount: total,

              currency: "INR",

              paymentMethod: "ONLINE",

              paymentStatus: "pending",

              orderStatus: "Pending",

              shippingAddress: shipping_address,
            });
          });
        } catch (error) {
          console.error("Cashfree Error:", error);

          Order.markPaymentFailed(orderId, () => {});

          return res.status(500).json({
            message: "Unable to create Cashfree payment",
          });
        }
      },
    );
  });
};

// =========================================================
// VERIFY CASHFREE PAYMENT
// =========================================================

// =========================================================
// VERIFY CASHFREE PAYMENT
// =========================================================

exports.verifyPayment = async (req, res) => {
  const userId = req.user.id;

  const { cashfreeOrderId } = req.body;

  console.log("========================================");
  console.log("Cashfree Payment Verification");
  console.log("User ID:", userId);
  console.log("Cashfree Order ID:", cashfreeOrderId);
  console.log("========================================");

  if (!cashfreeOrderId) {
    return res.status(400).json({
      message: "Cashfree Order ID is required",
    });
  }

  // =======================================================
  // FIND LOCAL ORDER USING CASHFREE ORDER ID
  // =======================================================

  Order.getOrderByCashfreeId(cashfreeOrderId, userId, async (err, orders) => {
    if (err) {
      console.error("Get Cashfree Order Error:", err);

      return res.status(500).json({
        message: "Unable to find order",
      });
    }

    if (!orders || orders.length === 0) {
      console.error(
        "Local order not found for Cashfree Order ID:",
        cashfreeOrderId,
      );

      return res.status(404).json({
        message: "Order not found",
      });
    }

    const order = orders[0];

    console.log("Local Order ID:", order.id);
    console.log("Cashfree Order ID:", order.cashfree_order_id);

    // =====================================================
    // ALREADY PAID
    // =====================================================

    if (order.payment_status === "paid") {
      return getCompleteOrder(
        order.id,
        userId,
        (completeErr, completeOrder) => {
          if (completeErr) {
            console.error("Complete Order Error:", completeErr);

            return res.status(500).json({
              message: "Payment already confirmed but failed to load order",
            });
          }

          if (!completeOrder) {
            return res.status(404).json({
              message:
                "Payment confirmed but order details could not be loaded",
            });
          }

          return res.json({
            success: true,
            orderId: order.id,
            cashfreeOrderId: order.cashfree_order_id,
            totalAmount: Number(order.total_amount),
            paymentMethod: order.payment_method,
            paymentStatus: "paid",
            orderStatus: completeOrder.order_status,
            shippingAddress: parseShippingAddress(
              completeOrder.shipping_address,
            ),
            cashfreePaymentId: completeOrder.cashfree_payment_id,
            order: completeOrder,
            message: "Payment already confirmed",
          });
        },
      );
    }

    // =====================================================
    // CASHFREE ORDER ID CHECK
    // =====================================================

    if (!order.cashfree_order_id) {
      return res.status(400).json({
        message: "Cashfree order ID not found",
      });
    }

    try {
      // ===================================================
      // GET PAYMENT STATUS FROM CASHFREE
      // ===================================================

      const response = await fetch(
        `${CASHFREE_BASE_URL}/orders/${encodeURIComponent(
          order.cashfree_order_id,
        )}/payments`,
        {
          method: "GET",

          headers: cashfreeHeaders(),
        },
      );

      const payments = await response.json();

      console.log(
        "Cashfree payment response:",
        JSON.stringify(payments, null, 2),
      );

      if (!response.ok) {
        console.error("Cashfree Payment Status Error:", payments);

        return res.status(500).json({
          message:
            payments.message || "Unable to check Cashfree payment status",
        });
      }

      if (!Array.isArray(payments)) {
        return res.status(500).json({
          message: "Invalid Cashfree payment response",
        });
      }

      // ===================================================
      // SUCCESS PAYMENT
      // ===================================================

      const successfulPayment = payments.find(
        (payment) => String(payment.payment_status).toUpperCase() === "SUCCESS",
      );

      if (successfulPayment) {
        const paymentId =
          successfulPayment.cf_payment_id || successfulPayment.payment_id;

        console.log("Cashfree Payment Successful:", paymentId);

        return Order.markPaymentSuccessful(order.id, paymentId, (updateErr) => {
          if (updateErr) {
            console.error("Mark Payment Successful Error:", updateErr);

            return res.status(500).json({
              message: "Payment successful but database update failed",
            });
          }

          // =============================================
          // CLEAR CART
          // =============================================

          Order.clearCart(userId, (clearErr) => {
            if (clearErr) {
              console.error("Clear Cart Error:", clearErr);
            }

            // ===========================================
            // LOAD COMPLETE ORDER
            // ===========================================

            getCompleteOrder(order.id, userId, (completeErr, completeOrder) => {
              if (completeErr) {
                console.error("Complete Order Error:", completeErr);

                return res.status(500).json({
                  message: "Payment successful but failed to load order",
                });
              }

              if (!completeOrder) {
                console.error(
                  "Complete order is empty for local order ID:",
                  order.id,
                );

                return res.status(500).json({
                  message:
                    "Payment successful but order details could not be loaded",
                });
              }

              console.log(
                "Complete Order:",
                JSON.stringify(completeOrder, null, 2),
              );

              return res.json({
                success: true,
                orderId: order.id,
                cashfreeOrderId: order.cashfree_order_id,
                totalAmount: Number(order.total_amount),
                paymentMethod: order.payment_method,
                paymentStatus: "paid",
                orderStatus: "Confirmed",
                shippingAddress: parseShippingAddress(order.shipping_address),
                cashfreePaymentId: paymentId,
                order: completeOrder,
                message: "Payment verified successfully",
              });
            });
          });
        });
      }

      // ===================================================
      // FAILED PAYMENT
      // ===================================================

      const failedPayment = payments.find(
        (payment) => String(payment.payment_status).toUpperCase() === "FAILED",
      );

      if (failedPayment) {
        return Order.markPaymentFailed(order.id, (updateErr) => {
          if (updateErr) {
            console.error("Mark Failed Error:", updateErr);
          }

          return res.status(400).json({
            success: false,

            orderId: order.id,

            cashfreeOrderId: order.cashfree_order_id,

            paymentStatus: "failed",

            orderStatus: "Failed",

            message: failedPayment.payment_message || "Payment failed",
          });
        });
      }

      // ===================================================
      // PAYMENT STILL PENDING
      // ===================================================

      return res.status(202).json({
        success: false,

        orderId: order.id,

        cashfreeOrderId: order.cashfree_order_id,

        paymentStatus: "pending",

        orderStatus: order.order_status,

        message:
          "Payment is still being processed. Please check My Orders after a few moments.",
      });
    } catch (error) {
      console.error("Cashfree Verify Error:", error);

      return res.status(500).json({
        message: "Unable to verify Cashfree payment",
      });
    }
  });
};

// =========================================================
// CASHFREE WEBHOOK
// =========================================================

exports.cashfreeWebhook = async (req, res) => {
  try {
    console.log("Cashfree Webhook:", req.body);

    const event = req.body;

    const orderId = event?.data?.order?.order_id;

    const payment = event?.data?.payment;

    if (!orderId) {
      return res.status(200).json({
        received: true,
      });
    }

    // =====================================================
    // FIND LOCAL ORDER
    // =====================================================

    const sql = `
      SELECT *
      FROM orders
      WHERE cashfree_order_id = ?
      LIMIT 1
    `;

    const db = require("../config/database");

    db.query(sql, [orderId], (err, orders) => {
      if (err) {
        console.error("Webhook DB Error:", err);

        return res.status(500).json({
          message: "Database error",
        });
      }

      if (!orders || orders.length === 0) {
        console.log("Webhook order not found:", orderId);

        return res.status(200).json({
          received: true,
        });
      }

      const localOrder = orders[0];

      const paymentStatus = payment?.payment_status;

      if (paymentStatus === "SUCCESS") {
        const paymentId = payment?.cf_payment_id || payment?.payment_id;

        Order.markPaymentSuccessful(localOrder.id, paymentId, (updateErr) => {
          if (updateErr) {
            console.error("Webhook Update Error:", updateErr);
          } else {
            Order.clearCart(localOrder.user_id, () => {});
          }
        });
      }

      if (paymentStatus === "FAILED") {
        Order.markPaymentFailed(localOrder.id, () => {});
      }

      return res.status(200).json({
        received: true,
      });
    });
  } catch (error) {
    console.error("Cashfree Webhook Error:", error);

    return res.status(200).json({
      received: true,
    });
  }
};

// =========================================================
// GET COMPLETE ORDER
// =========================================================

exports.getOrder = (req, res) => {
  const userId = req.user.id;

  const orderId = req.params.id;

  getCompleteOrder(orderId, userId, (err, order) => {
    if (err) {
      console.error("Get Complete Order Error:", err);

      return res.status(500).json({
        message: "Failed to fetch order",
      });
    }

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      order,
    });
  });
};

// =========================================================
// GET USER ORDERS
// =========================================================

exports.getOrders = (req, res) => {
  const userId = req.user.id;

  Order.getOrders(userId, (err, result) => {
    if (err) {
      console.error("Get Orders Error:", err);

      return res.status(500).json({
        message: "Failed to fetch orders",
      });
    }

    res.json(result);
  });
};

// =========================================================
// GENERATE INVOICE PDF
// GET /api/orders/:id/invoice
// =========================================================

exports.generateInvoice = (req, res) => {
  const userId = req.user.id;

  const orderId = req.params.id;

  getCompleteOrder(orderId, userId, (err, order) => {
    if (err) {
      console.error("Invoice Order Error:", err);

      return res.status(500).json({
        message: "Unable to generate invoice",
      });
    }

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const doc = new PDFDocument({
      margin: 50,
    });

    const filename = `HomeNeeds-Invoice-${order.id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

    doc.pipe(res);

    // =====================================================
    // HEADER
    // =====================================================

    doc.fontSize(26).font("Helvetica-Bold").text("HomeNeeds", {
      align: "left",
    });

    doc.fontSize(10).font("Helvetica").text("Home & Lifestyle Store");

    doc.moveDown();

    doc.fontSize(20).font("Helvetica-Bold").text("INVOICE", {
      align: "right",
    });

    doc.moveDown();

    // =====================================================
    // ORDER INFORMATION
    // =====================================================

    doc.fontSize(11).font("Helvetica");

    doc.text(`Invoice / Order ID: #${order.id}`);

    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}`);

    doc.text(`Payment Method: ${order.payment_method}`);

    doc.text(`Payment Status: ${order.payment_status}`);

    doc.text(`Order Status: ${order.order_status}`);

    doc.moveDown();

    // =====================================================
    // SHIPPING ADDRESS
    // =====================================================

    const address = parseShippingAddress(order.shipping_address);

    doc.fontSize(14).font("Helvetica-Bold").text("Shipping Address");

    doc.fontSize(11).font("Helvetica");

    doc.text(address.name || "");

    doc.text(address.address || "");

    doc.text(`${address.city || ""}, ${address.state || ""}`);

    doc.text(`PIN: ${address.pincode || ""}`);

    doc.text(`Phone: ${address.phone || ""}`);

    doc.moveDown();

    // =====================================================
    // PRODUCTS
    // =====================================================

    doc.fontSize(14).font("Helvetica-Bold").text("Order Items");

    doc.moveDown();

    let y = doc.y;

    doc.fontSize(10).font("Helvetica-Bold");

    doc.text("Product", 50, y);

    doc.text("Qty", 320, y);

    doc.text("Price", 380, y);

    doc.text("Total", 460, y);

    y += 25;

    doc.font("Helvetica");

    let subtotal = 0;

    order.items.forEach((item) => {
      const itemTotal = Number(item.price) * Number(item.quantity);

      subtotal += itemTotal;

      doc.text(item.name || "Product", 50, y, {
        width: 250,
      });

      doc.text(String(item.quantity), 320, y);

      doc.text(`₹${Number(item.price).toFixed(2)}`, 380, y);

      doc.text(`₹${itemTotal.toFixed(2)}`, 460, y);

      y += 30;

      if (y > 700) {
        doc.addPage();

        y = 50;
      }
    });

    // =====================================================
    // TOTAL
    // =====================================================

    const gst = subtotal * 0.18;

    const shipping = subtotal >= 1000 ? 0 : 99;

    const total = subtotal + gst + shipping;

    y += 10;

    doc.moveTo(350, y).lineTo(550, y).stroke();

    y += 15;

    doc.font("Helvetica").text("Subtotal:", 350, y);

    doc.text(`₹${subtotal.toFixed(2)}`, 460, y);

    y += 20;

    doc.text("GST:", 350, y);

    doc.text(`₹${gst.toFixed(2)}`, 460, y);

    y += 20;

    doc.text("Shipping:", 350, y);

    doc.text(shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`, 460, y);

    y += 25;

    doc.font("Helvetica-Bold").fontSize(13).text("Grand Total:", 350, y);

    doc.text(`₹${total.toFixed(2)}`, 460, y);

    // =====================================================
    // FOOTER
    // =====================================================

    doc
      .fontSize(9)
      .font("Helvetica")
      .text("Thank you for shopping with HomeNeeds!", 50, 750, {
        align: "center",
        width: 500,
      });

    doc.end();
  });
};
