import "./AdminOrderDetails.css";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiMapPin,
  FiShoppingBag,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
      return "-";
    }

    return formattedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     FORMAT DATE + TIME
  ========================================================= */

  const formatDateTime = (date) => {
    if (!date) {
      return "-";
    }

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
      return "-";
    }

    return formattedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================================================
     FORMAT AMOUNT
  ========================================================= */

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /* =========================================================
     GET INITIALS
  ========================================================= */

  const getInitials = (name) => {
    if (!name) {
      return "C";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  /* =========================================================
     LOAD ORDER
     
     We use the existing /api/admin/orders endpoint.
     No new backend API is required for this page.
  ========================================================= */

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${VITE_API_URL}/api/admin/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      const allOrders = Array.isArray(data.orders) ? data.orders : [];

      const foundOrder = allOrders.find(
        (item) => String(item.id) === String(orderId),
      );

      if (!foundOrder) {
        throw new Error("Order not found");
      }

      setOrder(foundOrder);
    } catch (error) {
      console.error("Admin order details error:", error);

      setError(
        error.message === "Order not found"
          ? "The requested order could not be found."
          : "Failed to load order details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  /* =========================================================
     BACK
  ========================================================= */

  const goBack = () => {
    navigate("/admin/orders");
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="admin-order-details-page">
        <div className="admin-order-details-loading">
          <div className="order-details-spinner"></div>

          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !order) {
    return (
      <div className="admin-order-details-page">
        <div className="order-details-topbar">
          <button type="button" className="order-back-button" onClick={goBack}>
            <FiArrowLeft />

            <span>Back to Orders</span>
          </button>
        </div>

        <div className="order-details-error">
          <FiAlertCircle />

          <h2>Order Not Found</h2>

          <p>{error || "Unable to load this order."}</p>

          <button
            type="button"
            className="order-details-retry"
            onClick={fetchOrder}
          >
            <FiRefreshCw />

            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const orderStatus = String(order.order_status || "pending")
    .toLowerCase()
    .replace(/\s+/g, "-");

  const paymentStatus = String(order.payment_status || "pending").toLowerCase();

  return (
    <div className="admin-order-details-page">
      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <div className="order-details-topbar">
        <button type="button" className="order-back-button" onClick={goBack}>
          <FiArrowLeft />

          <span>Back to Orders</span>
        </button>
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="order-details-header">
        <div>
          <span className="order-details-label">ORDER DETAILS</span>

          <h1>Order #{order.public_order_id}</h1>

          <p>Placed on {formatDateTime(order.created_at)}</p>
        </div>

        <span className={`order-details-status ${orderStatus}`}>
          <span className="order-details-status-dot"></span>

          {order.order_status || "Pending"}
        </span>
      </div>

      {/* =====================================================
          DETAILS GRID
      ===================================================== */}

      <div className="order-details-grid">
        {/* ===================================================
            CUSTOMER
        =================================================== */}
        <div className="order-details-card">
          <div className="order-details-card-header">
            <div className="order-details-card-icon">
              <FiUser />
            </div>

            <div>
              <h2>Customer Information</h2>

              <p>Customer details</p>
            </div>
          </div>

          <div className="order-customer-details">
            <div className="order-customer-name">
              <div className="order-customer-avatar">
                {getInitials(order.customer_name)}
              </div>

              <div>
                <strong>{order.customer_name || "Unknown Customer"}</strong>

                <span>Customer</span>
              </div>
            </div>

            <div className="order-contact-item">
              <FiMail />

              <div>
                <span>Email</span>

                <strong>{order.customer_email || "-"}</strong>
              </div>
            </div>

            <div className="order-contact-item">
              <FiPhone />

              <div>
                <span>Phone</span>

                <strong>{order.customer_phone || "-"}</strong>
              </div>
            </div>
          </div>
        </div>
        {/* ===================================================
            PAYMENT
        =================================================== */}
        <div className="order-details-card">
          <div className="order-details-card-header">
            <div className="order-details-card-icon">
              <FiCreditCard />
            </div>

            <div>
              <h2>Payment Information</h2>

              <p>Payment and transaction details</p>
            </div>
          </div>

          <div className="order-payment-details">
            <div>
              <span>Payment Method</span>

              <strong>{order.payment_method || "-"}</strong>
            </div>

            <div>
              <span>Payment Status</span>

              <strong className={`order-payment-status ${paymentStatus}`}>
                {order.payment_status || "Pending"}
              </strong>
            </div>

            <div>
              <span>Order Status</span>

              <strong>{order.order_status || "Pending"}</strong>
            </div>

            <div>
              <span>Order Date</span>

              <strong>{formatDate(order.created_at)}</strong>
            </div>

            <div>
              <span>Total Amount</span>

              <strong className="order-total-amount">
                ₹{formatAmount(order.total_amount)}
              </strong>
            </div>
          </div>
        </div>
        {/* ===================================================
            SHIPPING / ADDRESS
        =================================================== */}
        <div className="order-detail-card shipping-card">
          <div className="order-card-header">
            <div className="order-card-icon shipping-icon">
              <FiMapPin />
            </div>

            <div>
              <h2>Delivery Address</h2>
              <p>Customer shipping information</p>
            </div>
          </div>

          {order.shipping_address &&
          typeof order.shipping_address === "object" ? (
            <div className="shipping-address-content">
              {/* CUSTOMER */}
              <div className="shipping-customer">
                <div className="shipping-customer-avatar">
                  {getInitials(
                    order.shipping_address.fullName || order.customer_name,
                  )}
                </div>

                <div>
                  <strong>
                    {order.shipping_address.fullName ||
                      order.customer_name ||
                      "Customer"}
                  </strong>

                  <span>Shipping recipient</span>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="shipping-address-box">
                <span className="shipping-address-label">
                  <FiMapPin />
                  Delivery Address
                </span>

                <div className="shipping-address-text">
                  <strong>{order.shipping_address.address || "-"}</strong>

                  <span>
                    {order.shipping_address.city || "-"}
                    {order.shipping_address.state
                      ? `, ${order.shipping_address.state}`
                      : ""}
                  </span>

                  <span>Pincode: {order.shipping_address.pincode || "-"}</span>
                </div>
              </div>

              {/* CONTACT */}
              <div className="shipping-contact">
                <div className="shipping-contact-item">
                  <span className="shipping-contact-icon">
                    <FiPhone />
                  </span>

                  <div>
                    <span>Phone</span>

                    <strong>
                      {order.shipping_address.phone ||
                        order.customer_phone ||
                        "-"}
                    </strong>
                  </div>
                </div>

                <div className="shipping-contact-item">
                  <span className="shipping-contact-icon">
                    <FiMail />
                  </span>

                  <div>
                    <span>Email</span>

                    <strong>{order.customer_email || "-"}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="shipping-empty">
              <FiMapPin />

              <strong>No delivery address available</strong>

              <span>Shipping information was not provided for this order.</span>
            </div>
          )}
        </div>

        {/* ===================================================
            ORDER SUMMARY
        =================================================== */}
        <div className="order-details-card">
          <div className="order-details-card-header">
            <div className="order-details-card-icon">
              <FiShoppingBag />
            </div>

            <div>
              <h2>Order Summary</h2>

              <p>Order amount details</p>
            </div>
          </div>

          <div className="order-summary-details">
            <div>
              <span>Order ID</span>

              <strong>#{order.id}</strong>
            </div>

            <div>
              <span>Items</span>

              <strong>
                {order.item_count ?? order.items_count ?? order.quantity ?? "-"}
              </strong>
            </div>

            <div>
              <span>Subtotal</span>

              <strong>
                ₹{formatAmount(order.subtotal ?? order.total_amount)}
              </strong>
            </div>

            {order.shipping_amount !== undefined &&
              order.shipping_amount !== null && (
                <div>
                  <span>Shipping</span>

                  <strong>₹{formatAmount(order.shipping_amount)}</strong>
                </div>
              )}

            {order.discount_amount !== undefined &&
              order.discount_amount !== null && (
                <div>
                  <span>Discount</span>

                  <strong>-₹{formatAmount(order.discount_amount)}</strong>
                </div>
              )}

            <div className="order-summary-total">
              <span>Total</span>

              <strong>₹{formatAmount(order.total_amount)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CASHFREE
      ===================================================== */}

      {order.cashfree_order_id && (
        <div className="order-cashfree-card">
          <span>Cashfree Order ID</span>

          <strong>{order.cashfree_order_id}</strong>
        </div>
      )}
    </div>
  );
}

export default AdminOrderDetails;
