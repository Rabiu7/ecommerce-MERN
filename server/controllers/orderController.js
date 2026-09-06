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
  isBuyNow,
  callback,
) {
  Order.createOrder(
    userId,
    total,
    paymentMethod,
    paymentStatus,
    orderStatus,
    shippingAddress,
    isBuyNow,
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

  const {
    payment_method,
    shipping_address,
    buy_now,
    buy_now_product_id,
    buy_now_quantity,
  } = req.body;

  const isBuyNow = buy_now === true;

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

  // =======================================================
  // GET ORDER ITEMS
  // =======================================================

  const loadOrderItems = (callback) => {
    // =====================================================
    // BUY NOW
    // =====================================================

    if (isBuyNow) {
      if (!buy_now_product_id) {
        return callback(new Error("Buy Now product is required"));
      }

      const quantity = Number(buy_now_quantity || 1);

      if (quantity < 1) {
        return callback(new Error("Invalid quantity"));
      }

      return Order.getBuyNowProduct(
        buy_now_product_id,
        (productErr, products) => {
          if (productErr) {
            return callback(productErr);
          }

          if (!products || products.length === 0) {
            return callback(new Error("Product not found"));
          }

          const product = products[0];

          if (Number(product.stock) < quantity) {
            return callback(new Error("Insufficient product stock"));
          }

          return callback(null, [
            {
              product_id: product.product_id,
              quantity,
              price: Number(product.price),
            },
          ]);
        },
      );
    }

    // =====================================================
    // NORMAL CART
    // =====================================================

    Order.getCart(userId, callback);
  };

  loadOrderItems((err, cart) => {
    if (err) {
      console.error("Get Order Items Error:", err);

      return res.status(400).json({
        message: err.message || "Failed to get order items",
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
        isBuyNow,
        (createErr, orderId) => {
          if (createErr) {
            console.error("COD Order Error:", createErr);

            return res.status(500).json({
              message: "Failed to create order",
            });
          }

          const finishOrder = () => {
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
          };

          if (isBuyNow) {
            return finishOrder();
          }

          Order.clearCart(userId, (clearErr) => {
            if (clearErr) {
              console.error("Clear Cart Error:", clearErr);
            }

            return finishOrder();
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
      isBuyNow,
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

            order_note: `HomeNeeds Order ${orderId}`,
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

          const finishSuccessfulPayment = () => {
            getCompleteOrder(order.id, userId, (completeErr, completeOrder) => {
              if (completeErr) {
                console.error("Complete Order Error:", completeErr);

                return res.status(500).json({
                  message: "Payment successful but failed to load order",
                });
              }

              if (!completeOrder) {
                return res.status(500).json({
                  message:
                    "Payment successful but order details could not be loaded",
                });
              }

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
          };

          if (order.is_buy_now) {
            return finishSuccessfulPayment();
          }

          Order.clearCart(userId, (clearErr) => {
            if (clearErr) {
              console.error("Clear Cart Error:", clearErr);
            }

            return finishSuccessfulPayment();
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
            return;
          }

          // Only clear cart for normal cart orders.
          if (Number(localOrder.is_buy_now) === 1) {
            return;
          }

          Order.clearCart(localOrder.user_id, (clearErr) => {
            if (clearErr) {
              console.error("Webhook Clear Cart Error:", clearErr);
            }
          });
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

// =========================================================
// GENERATE PROFESSIONAL INVOICE PDF
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
      size: "A4",
      margin: 40,
      bufferPages: true,
    });

    const filename = `HomeNeeds-Invoice-${order.id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    doc.pipe(res);

    // =====================================================
    // COLORS
    // =====================================================

    const BRAND = "#a27b3f";
    const BRAND_DARK = "#8d6834";
    const BRAND_LIGHT = "#f3ede3";

    const TEXT = "#333333";
    const SECONDARY = "#777777";
    const BORDER = "#e5e5e5";
    const WHITE = "#ffffff";
    const SUCCESS = "#4f8662";

    // =====================================================
    // PAGE CONSTANTS
    // =====================================================

    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;

    const LEFT = 40;
    const RIGHT = 555;

    const CONTENT_WIDTH = RIGHT - LEFT;

    // =====================================================
    // ADDRESS
    // =====================================================

    const address = parseShippingAddress(order.shipping_address);

    const customerName = address.fullName || address.name || "Customer";

    const customerPhone = address.phone || "";

    const addressLine = address.address || "";

    const cityStatePin = [address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(", ");

    // =====================================================
    // PAYMENT
    // =====================================================

    const isCOD = String(order.payment_method || "").toUpperCase() === "COD";

    const paymentMethod = isCOD ? "Cash on Delivery" : "Online Payment";

    const paymentStatus = isCOD
      ? "Pay on Delivery"
      : String(order.payment_status || "Paid");

    const orderStatus = order.order_status || "Confirmed";

    // =====================================================
    // CALCULATE AMOUNTS
    // =====================================================

    let subtotal = 0;

    const items = Array.isArray(order.items) ? order.items : [];

    items.forEach((item) => {
      const price = Number(item.price || 0);
      const quantity = Number(item.quantity || 0);

      subtotal += price * quantity;
    });

    subtotal = Math.round(subtotal * 100) / 100;

    const gst = Math.round(subtotal * 0.18 * 100) / 100;

    const shipping = subtotal >= 1000 ? 0 : 99;

    const calculatedTotal = Math.round((subtotal + gst + shipping) * 100) / 100;

    // Prefer database total if available
    const grandTotal = Number(order.total_amount || calculatedTotal);

    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================

    const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    const drawLine = (y, color = BORDER) => {
      doc
        .strokeColor(color)
        .lineWidth(1)
        .moveTo(LEFT, y)
        .lineTo(RIGHT, y)
        .stroke();
    };

    const drawRoundedBox = (x, y, width, height, fill, stroke = BORDER) => {
      doc.roundedRect(x, y, width, height, 8).fillAndStroke(fill, stroke);
    };

    // =====================================================
    // HEADER
    // =====================================================

    doc.roundedRect(LEFT, 35, CONTENT_WIDTH, 95, 10).fill(BRAND_LIGHT);

    // Brand
    doc
      .fillColor(BRAND)
      .font("Helvetica-Bold")
      .fontSize(25)
      .text("HomeNeeds", LEFT + 20, 55);

    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(10)
      .text("Home & Lifestyle Store", LEFT + 21, 88);

    // Invoice title
    doc
      .fillColor(TEXT)
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("INVOICE", 400, 53, {
        width: 130,
        align: "right",
      });

    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(9)
      .text(`Invoice #${order.id}`, 400, 87, {
        width: 130,
        align: "right",
      });

    // =====================================================
    // ORDER META
    // =====================================================

    let y = 150;

    doc
      .fillColor(TEXT)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("ORDER INFORMATION", LEFT, y);

    y += 20;

    const metaWidth = CONTENT_WIDTH / 3;

    // Date
    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(8)
      .text("ORDER DATE", LEFT, y);

    doc
      .fillColor(TEXT)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(formatDate(order.created_at), LEFT, y + 12);

    // Payment
    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(8)
      .text("PAYMENT METHOD", LEFT + metaWidth, y);

    doc
      .fillColor(TEXT)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(paymentMethod, LEFT + metaWidth, y + 12);

    // Status
    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(8)
      .text("ORDER STATUS", LEFT + metaWidth * 2, y);

    doc
      .fillColor(SUCCESS)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(orderStatus, LEFT + metaWidth * 2, y + 12);

    y += 45;

    drawLine(y);

    // =====================================================
    // BILL TO / SHIPPING ADDRESS
    // =====================================================

    y += 20;

    const boxGap = 15;
    const boxWidth = (CONTENT_WIDTH - boxGap) / 2;

    const boxHeight = 125;

    // Bill To
    drawRoundedBox(LEFT, y, boxWidth, boxHeight, WHITE);

    doc
      .fillColor(BRAND)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("BILL TO", LEFT + 15, y + 15);

    doc
      .fillColor(TEXT)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(customerName, LEFT + 15, y + 38);

    if (customerPhone) {
      doc
        .fillColor(SECONDARY)
        .font("Helvetica")
        .fontSize(9)
        .text(`Phone: ${customerPhone}`, LEFT + 15, y + 60);
    }

    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(9)
      .text("Thank you for choosing HomeNeeds.", LEFT + 15, y + 82, {
        width: boxWidth - 30,
      });

    // Shipping
    const shippingX = LEFT + boxWidth + boxGap;

    drawRoundedBox(shippingX, y, boxWidth, boxHeight, WHITE);

    doc
      .fillColor(BRAND)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("SHIPPING ADDRESS", shippingX + 15, y + 15);

    doc
      .fillColor(TEXT)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(customerName, shippingX + 15, y + 38);

    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(9)
      .text(addressLine, shippingX + 15, y + 59, {
        width: boxWidth - 30,
      });

    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(9)
      .text(cityStatePin, shippingX + 15, y + 80, {
        width: boxWidth - 30,
      });

    if (customerPhone) {
      doc
        .fillColor(SECONDARY)
        .font("Helvetica")
        .fontSize(9)
        .text(`Phone: ${customerPhone}`, shippingX + 15, y + 99);
    }

    y += boxHeight + 30;

    // =====================================================
    // ORDER ITEMS TITLE
    // =====================================================

    doc
      .fillColor(TEXT)
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Order Items", LEFT, y);

    y += 20;

    // =====================================================
    // TABLE
    // =====================================================

    const col = {
      sno: LEFT,
      product: LEFT + 35,
      qty: 370,
      price: 425,
      total: 490,
    };

    const tableWidth = CONTENT_WIDTH;

    const headerHeight = 30;

    // Table Header
    doc.roundedRect(LEFT, y, tableWidth, headerHeight, 6).fill(BRAND);

    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8);

    doc.text("S.NO", col.sno + 8, y + 10);

    doc.text("PRODUCT", col.product, y + 10);

    doc.text("QTY", col.qty, y + 10, {
      width: 35,
      align: "center",
    });

    doc.text("UNIT PRICE", col.price - 10, y + 10, {
      width: 65,
      align: "right",
    });

    doc.text("AMOUNT", col.total - 5, y + 10, {
      width: 65,
      align: "right",
    });

    y += headerHeight;

    // =====================================================
    // TABLE ROWS
    // =====================================================

    items.forEach((item, index) => {
      const quantity = Number(item.quantity || 0);

      const price = Number(item.price || 0);

      const itemTotal = quantity * price;

      // Page break
      if (y > 710) {
        doc.addPage();

        y = 50;

        // Repeat table header
        doc.roundedRect(LEFT, y, tableWidth, headerHeight, 6).fill(BRAND);

        doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8);

        doc.text("S.NO", col.sno + 8, y + 10);

        doc.text("PRODUCT", col.product, y + 10);

        doc.text("QTY", col.qty, y + 10, {
          width: 35,
          align: "center",
        });

        doc.text("UNIT PRICE", col.price - 10, y + 10, {
          width: 65,
          align: "right",
        });

        doc.text("AMOUNT", col.total - 5, y + 10, {
          width: 65,
          align: "right",
        });

        y += headerHeight;
      }

      const rowHeight = 38;

      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(LEFT, y, tableWidth, rowHeight).fill("#faf9f7");
      }

      // Bottom border
      doc
        .strokeColor(BORDER)
        .lineWidth(0.7)
        .moveTo(LEFT, y + rowHeight)
        .lineTo(LEFT + tableWidth, y + rowHeight)
        .stroke();

      doc.fillColor(SECONDARY).font("Helvetica").fontSize(9);

      // S.No
      doc.text(String(index + 1), col.sno + 8, y + 13);

      // Product
      doc
        .fillColor(TEXT)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(item.name || "Product", col.product, y + 9, {
          width: 180,
          height: 22,
          ellipsis: true,
        });

      // Qty
      doc
        .fillColor(SECONDARY)
        .font("Helvetica")
        .fontSize(9)
        .text(String(quantity), col.qty, y + 13, {
          width: 35,
          align: "center",
        });

      // Price
      doc.text(formatCurrency(price), col.price - 10, y + 13, {
        width: 65,
        align: "right",
      });

      // Total
      doc
        .fillColor(TEXT)
        .font("Helvetica-Bold")
        .text(formatCurrency(itemTotal), col.total - 5, y + 13, {
          width: 65,
          align: "right",
        });

      y += rowHeight;
    });

    // =====================================================
    // TOTAL SECTION
    // =====================================================

    if (y > 650) {
      doc.addPage();
      y = 50;
    }

    y += 25;

    const summaryX = 345;
    const summaryWidth = 210;

    // Summary box
    drawRoundedBox(summaryX, y, summaryWidth, 170, BRAND_LIGHT, "#e5dccd");

    let summaryY = y + 18;

    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(9)
      .text("Subtotal", summaryX + 15, summaryY);

    doc
      .fillColor(TEXT)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(formatCurrency(subtotal), summaryX + 100, summaryY, {
        width: 95,
        align: "right",
      });

    summaryY += 27;

    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(9)
      .text("GST (18%)", summaryX + 15, summaryY);

    doc
      .fillColor(TEXT)
      .font("Helvetica-Bold")
      .text(formatCurrency(gst), summaryX + 100, summaryY, {
        width: 95,
        align: "right",
      });

    summaryY += 27;

    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(9)
      .text("Shipping", summaryX + 15, summaryY);

    doc
      .fillColor(shipping === 0 ? SUCCESS : TEXT)
      .font("Helvetica-Bold")
      .text(
        shipping === 0 ? "FREE" : formatCurrency(shipping),
        summaryX + 100,
        summaryY,
        {
          width: 95,
          align: "right",
        },
      );

    summaryY += 25;

    doc
      .strokeColor("#d8cdbd")
      .lineWidth(1)
      .moveTo(summaryX + 15, summaryY)
      .lineTo(summaryX + summaryWidth - 15, summaryY)
      .stroke();

    summaryY += 17;

    doc
      .fillColor(TEXT)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Grand Total", summaryX + 15, summaryY);

    doc
      .fillColor(BRAND)
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(formatCurrency(grandTotal), summaryX + 85, summaryY - 2, {
        width: 110,
        align: "right",
      });

    // =====================================================
    // PAYMENT INFORMATION
    // =====================================================

    const paymentBoxY = y;

    drawRoundedBox(LEFT, paymentBoxY, 285, 170, WHITE);

    doc
      .fillColor(BRAND)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("PAYMENT INFORMATION", LEFT + 15, paymentBoxY + 18);

    doc
      .fillColor(TEXT)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(paymentMethod, LEFT + 15, paymentBoxY + 45);

    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(9)
      .text("Payment Status", LEFT + 15, paymentBoxY + 70);

    doc
      .fillColor(isCOD ? BRAND : SUCCESS)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(paymentStatus, LEFT + 15, paymentBoxY + 86);

    if (order.cashfree_payment_id) {
      doc
        .fillColor(SECONDARY)
        .font("Helvetica")
        .fontSize(8)
        .text("Payment Reference", LEFT + 15, paymentBoxY + 115);

      doc
        .fillColor(TEXT)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(String(order.cashfree_payment_id), LEFT + 15, paymentBoxY + 130, {
          width: 250,
          ellipsis: true,
        });
    }

    // =====================================================
    // FOOTER
    // =====================================================

    const footerY = PAGE_HEIGHT - 55;

    drawLine(footerY - 10);

    doc
      .fillColor(BRAND)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("HomeNeeds", LEFT, footerY);

    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(8)
      .text("Thank you for shopping with us.", LEFT + 75, footerY + 1);

    doc
      .fillColor(SECONDARY)
      .font("Helvetica")
      .fontSize(8)
      .text("This is a computer-generated invoice.", 350, footerY + 1, {
        width: 205,
        align: "right",
      });

    // =====================================================
    // PAGE NUMBERS
    // =====================================================

    const range = doc.bufferedPageRange();

    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      doc
        .fillColor(SECONDARY)
        .font("Helvetica")
        .fontSize(7)
        .text(`Page ${i + 1} of ${range.count}`, LEFT, PAGE_HEIGHT - 30, {
          width: CONTENT_WIDTH,
          align: "center",
        });
    }

    // =====================================================
    // FINISH PDF
    // =====================================================

    doc.end();
  });
};
