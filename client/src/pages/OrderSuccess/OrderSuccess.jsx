import "./OrderSuccess.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  FiCheckCircle,
  FiShoppingBag,
  FiPackage,
  FiDownload,
  FiMapPin,
  FiCreditCard,
  FiArrowRight,
} from "react-icons/fi";

import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function OrderSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(false);

  // Prevent duplicate verification in React StrictMode
  const verificationStarted = useRef(false);

  // =====================================================
  // CASHFREE ORDER ID
  // =====================================================

  const queryCashfreeOrderId = searchParams.get("order_id");

  const cashfreeOrderId =
    queryCashfreeOrderId || localStorage.getItem("cashfreeOrderId");

  // =====================================================
  // VERIFY PAYMENT
  // =====================================================

  const verifyPayment = async () => {
    if (!cashfreeOrderId) {
      console.error("Cashfree Order ID is missing");

      setVerificationError(true);
      setLoading(false);

      toast.error("Cashfree order ID is missing.");

      return;
    }

    try {
      setVerifying(true);
      setVerificationError(false);

      console.log("====================================");
      console.log("Cashfree Payment Verification");
      console.log("Cashfree Order ID:", cashfreeOrderId);
      console.log("====================================");

      const response = await fetch(
        `${VITE_API_URL}/api/orders/verify-payment`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },

          body: JSON.stringify({
            cashfreeOrderId,
          }),
        },
      );

      const data = await response.json();

      console.log("Payment Verification Response:", data);

      // =================================================
      // PAYMENT SUCCESS
      // =================================================

      if (response.ok && data.success && data.paymentStatus === "paid") {
        console.log("✅ Payment successful");
        console.log("Local Order ID:", data.orderId);
        console.log("Cashfree Order ID:", data.cashfreeOrderId);

        if (!data.order) {
          console.error("Backend returned no complete order");

          throw new Error(
            "Payment successful but order details could not be loaded.",
          );
        }

        setOrder(data.order);

        // Save local order ID
        if (data.orderId) {
          localStorage.setItem("orderId", String(data.orderId));
        }

        // Cashfree ID is no longer required
        localStorage.removeItem("cashfreeOrderId");

        toast.success("Payment successful 🎉");

        return;
      }

      // =================================================
      // PAYMENT PENDING
      // =================================================

      if (response.status === 202 || data.paymentStatus === "pending") {
        toast.info(
          "Payment is still being processed. Please check My Orders shortly.",
        );

        return;
      }

      // =================================================
      // PAYMENT FAILED
      // =================================================

      if (data.paymentStatus === "failed") {
        toast.error(data.message || "Payment failed.");

        return;
      }

      // =================================================
      // UNKNOWN RESPONSE
      // =================================================

      console.error("Unknown payment response:", data);

      toast.error(data.message || "Unable to verify payment.");
    } catch (error) {
      console.error("Payment Verification Error:", error);

      setVerificationError(true);

      toast.error(error.message || "Unable to verify payment");
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  // =====================================================
  // RUN VERIFICATION ONCE
  // =====================================================

  useEffect(() => {
    window.scrollTo(0, 0);

    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    verifyPayment();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cashfreeOrderId]);

  // =====================================================
  // DOWNLOAD INVOICE
  // =====================================================

  const downloadInvoice = async () => {
    if (!order?.id) {
      toast.error("Order ID is not available.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${VITE_API_URL}/api/orders/${order.id}/invoice`,
        {
          method: "GET",

          headers: {
            Authorization: "Bearer " + token,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Unable to download invoice");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;

      link.download = `HomeNeeds-Invoice-${order.id}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(blobUrl);

      toast.success("Invoice downloaded");
    } catch (error) {
      console.error("Invoice Error:", error);

      toast.error("Unable to download invoice");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading || verifying) {
    return (
      <section className="order-success-page">
        <div className="success-loading">
          <div className="loading-check">
            <FiCheckCircle />
          </div>

          <h1>Confirming Your Payment</h1>

          <p>Please wait while we securely confirm your payment.</p>

          <div className="loading-order-id">
            {cashfreeOrderId || "Processing..."}
          </div>

          <div className="loading-spinner" />
        </div>
      </section>
    );
  }

  // =====================================================
  // PAYMENT NOT CONFIRMED
  // =====================================================

  if (!order) {
    return (
      <section className="order-success-page">
        <div className="success-empty">
          <div className="empty-icon">
            <FiCreditCard />
          </div>

          <span className="success-label">PAYMENT STATUS</span>

          <h1>
            {verificationError
              ? "We're Unable to Confirm Your Payment"
              : "Your Payment Is Processing"}
          </h1>

          <p>
            {verificationError
              ? "We couldn't confirm your payment right now. Don't worry — please check your order history before trying again."
              : "Your payment may still be processing. Please check your order history after a few moments."}
          </p>

          <div className="success-empty-actions">
            <button
              className="success-primary-btn"
              onClick={() => navigate("/orders")}
            >
              <FiPackage />
              View My Orders
              <FiArrowRight />
            </button>

            <button
              className="success-secondary-btn"
              onClick={() => navigate("/products")}
            >
              <FiShoppingBag />
              Continue Shopping
            </button>
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // ORDER DATA
  // =====================================================

  const localOrderId = order.id;

  const totalAmount = Number(order.total_amount || 0);

  const items = Array.isArray(order.items) ? order.items : [];

  const address = order.shipping_address || {};

  const getEstimatedDelivery = (orderDate) => {
    const start = new Date(orderDate);
    start.setDate(start.getDate() + 5);

    const end = new Date(orderDate);
    end.setDate(end.getDate() + 7);

    const formatDate = (date) =>
      date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const estimatedDelivery = getEstimatedDelivery(order.created_at);

  // =====================================================
  // SUCCESS PAGE
  // =====================================================

  return (
    <section className="order-success-page">
      <div className="success-wrapper">
        {/* =============================================
            SUCCESS HEADER
        ============================================= */}

        <div className="success-header">
          <div className="success-check">
            <FiCheckCircle />
          </div>

          <span className="success-label">PAYMENT CONFIRMED</span>

          <h1>Order placed successfully</h1>

          <p>
            Thank you for shopping with HomeNeeds. Your order has been confirmed
            and is now being prepared.
          </p>
        </div>

        {/* =============================================
            ORDER SUMMARY
        ============================================= */}

        <div className="order-summary-card">
          <div className="order-summary-main">
            <div>
              <span>ORDER NUMBER</span>

              <h2>#{localOrderId}</h2>
            </div>

            <div className="confirmed-badge">
              <span />
              {order.payment_status || "Paid"}
            </div>
          </div>

          <div className="order-summary-divider" />

          <div className="order-summary-details">
            <div>
              <FiCreditCard />

              <div>
                <span>Payment</span>
                <strong>{order.payment_method || "Online Payment"}</strong>
              </div>
            </div>

            <div>
              <FiPackage />

              <div>
                <span>Estimated Delivery</span>
                <strong>{estimatedDelivery}</strong>
              </div>
            </div>

            <div>
              <FiShoppingBag />

              <div>
                <span>Total Amount</span>
                <strong>₹{totalAmount.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* =============================================
            ORDERED ITEMS
        ============================================= */}

        <div className="success-section">
          <div className="section-heading">
            <div className="section-heading-icon">
              <FiPackage />
            </div>

            <div>
              <span>YOUR PURCHASE</span>
              <h2>Ordered Items</h2>
            </div>
          </div>

          <div className="products-card">
            {items.length > 0 ? (
              items.map((item) => {
                const itemTotal =
                  Number(item.price || 0) * Number(item.quantity || 0);

                return (
                  <div className="success-product" key={item.id}>
                    <div className="product-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name || "Product"} />
                      ) : (
                        <FiShoppingBag />
                      )}
                    </div>

                    <div className="product-info">
                      <h3>{item.name || "Product"}</h3>

                      <span>Quantity: {item.quantity}</span>

                      <span>Price: ₹{Number(item.price || 0).toFixed(2)}</span>
                    </div>

                    <div className="product-price">₹{itemTotal.toFixed(2)}</div>
                  </div>
                );
              })
            ) : (
              <div className="empty-items">
                <FiShoppingBag />
                <p>No order items found.</p>
              </div>
            )}
          </div>
        </div>

        {/* =============================================
            DELIVERY ADDRESS
        ============================================= */}

        <div className="success-section">
          <div className="section-heading">
            <div className="section-heading-icon">
              <FiMapPin />
            </div>

            <div>
              <span>DELIVERY DETAILS</span>
              <h2>Shipping Address</h2>
            </div>
          </div>

          <div className="address-card">
            <div className="address-icon">
              <FiMapPin />
            </div>

            <div className="address-content">
              <h3>{address.fullName || address.name || "Customer"}</h3>

              <p>{address.address || ""}</p>

              <p>
                {address.city || ""}
                {address.city && address.state ? ", " : ""}
                {address.state || ""} {address.pincode || ""}
              </p>

              {address.phone && <span>Phone: {address.phone}</span>}
            </div>
          </div>
        </div>

        {/* =============================================
            ACTIONS
        ============================================= */}

        <div className="success-actions">
          <button
            className="success-primary-btn"
            onClick={() => navigate("/orders")}
          >
            <FiPackage />
            View My Orders
            <FiArrowRight />
          </button>

          <button className="success-secondary-btn" onClick={downloadInvoice}>
            <FiDownload />
            Download Invoice
          </button>

          <button
            className="success-secondary-btn"
            onClick={() => navigate("/products")}
          >
            <FiShoppingBag />
            Continue Shopping
          </button>
        </div>

        <p className="success-footer">Thank you for choosing HomeNeeds.</p>
      </div>
    </section>
  );
}

export default OrderSuccess;
