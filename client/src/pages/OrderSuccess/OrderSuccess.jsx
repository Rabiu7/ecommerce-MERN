import "./OrderSuccess.css";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  FiCheckCircle,
  FiShoppingBag,
  FiPackage,
  FiDownload,
} from "react-icons/fi";

import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function OrderSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  // =====================================================
  // CASHFREE ORDER ID
  // =====================================================

  const cashfreeOrderId = searchParams.get("order_id");

  // =====================================================
  // VERIFY PAYMENT
  // =====================================================

  const verifyPayment = async () => {
    if (!cashfreeOrderId) {
      toast.error("Cashfree order ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setVerifying(true);

      console.log("Cashfree Order ID:", cashfreeOrderId);

      const response = await fetch(
        `${VITE_API_URL}/api/orders/verify-payment`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },

          body: JSON.stringify({
            cashfreeOrderId: cashfreeOrderId,
          }),
        },
      );

      const data = await response.json();

      console.log("Payment Verification:", data);

      // =================================================
      // PAYMENT SUCCESS
      // =================================================

      if (response.ok && data.success) {
        console.log("Local Order ID:", data.orderId);
        console.log("Cashfree Order ID:", data.cashfreeOrderId);
        console.log("Complete Order:", data.order);

        // Backend MUST return complete order here
        if (data.order) {
          setOrder(data.order);
        } else {
          console.error("Backend returned order: null");

          toast.error(
            "Payment successful, but order details could not be loaded.",
          );

          return;
        }

        // Store LOCAL order ID
        if (data.orderId) {
          localStorage.setItem("orderId", String(data.orderId));
        }

        toast.success("Payment successful 🎉");

        return;
      }

      // =================================================
      // PAYMENT STILL PENDING
      // =================================================

      if (response.status === 202) {
        toast.info(
          "Your payment may still be processing. Please check My Orders after a few moments.",
        );

        return;
      }

      // =================================================
      // PAYMENT FAILED
      // =================================================

      toast.error(data.message || "Payment verification failed");
    } catch (error) {
      console.error("Payment Verification Error:", error);

      toast.error("Unable to verify payment");
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  // =====================================================
  // RUN ON PAGE LOAD
  // =====================================================

  useEffect(() => {
    window.scrollTo(0, 0);

    verifyPayment();
  }, [cashfreeOrderId]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading || verifying) {
    return (
      <section className="order-success">
        <div className="success-container">
          <div className="success-icon">
            <FiCheckCircle />
          </div>

          <h1>Verifying Your Payment...</h1>

          <p className="success-message">
            Please wait while we confirm your Cashfree payment.
          </p>

          <div className="order-box">
            <div>
              <span>Cashfree Order ID</span>

              <strong>{cashfreeOrderId || "Not available"}</strong>
            </div>

            <div>
              <span>Status</span>

              <strong>Processing...</strong>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // PAYMENT PENDING / NO ORDER
  // =====================================================

  if (!order) {
    return (
      <section className="order-success">
        <div className="success-container">
          <div className="success-icon">
            <FiCheckCircle />
          </div>

          <h1>Payment Processing</h1>

          <p className="success-message">
            Your payment may still be processing. Please check My Orders after a
            few moments.
          </p>

          <div className="order-box">
            <div>
              <span>Cashfree Order ID</span>

              <strong>{cashfreeOrderId || "Not available"}</strong>
            </div>

            <div>
              <span>Status</span>

              <strong>Processing</strong>
            </div>
          </div>

          <div className="success-actions">
            <button className="primary-btn" onClick={() => navigate("/orders")}>
              <FiPackage />
              View My Orders
            </button>

            <button
              className="secondary-btn"
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
  // LOCAL ORDER ID
  // =====================================================

  const localOrderId = order.id;

  // =====================================================
  // ORDER DATA
  // =====================================================

  const totalAmount = Number(order.total_amount || 0);

  const items = order.items || [];

  const address = order.shipping_address || {};

  // =====================================================
  // DOWNLOAD INVOICE
  // =====================================================

  const downloadInvoice = async () => {
    try {
      const token = localStorage.getItem("token");

      const url = `${VITE_API_URL}/api/orders/${cashfreeOrderId}/invoice`;

      const response = await fetch(url, {
        method: "GET",

        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to download invoice");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;

      link.download = `HomeNeeds-Invoice-${localOrderId}.pdf`;

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
  // SUCCESS PAGE
  // =====================================================

  return (
    <section className="order-success">
      <div className="success-container">
        {/* SUCCESS ICON */}

        <div className="success-icon">
          <FiCheckCircle />
        </div>

        <h1>Order Placed Successfully 🎉</h1>

        <p className="success-message">
          Thank you for shopping with us. Your payment has been confirmed.
        </p>

        {/* ORDER INFORMATION */}

        <div className="order-box">
          <div>
            <span>Order ID</span>

            <strong>#{localOrderId}</strong>
          </div>

          <div>
            <span>Payment Status</span>

            <strong className="confirmed">{order.payment_status}</strong>
          </div>

          <div>
            <span>Order Status</span>

            <strong className="confirmed">{order.order_status}</strong>
          </div>

          <div>
            <span>Total</span>

            <strong>₹{totalAmount.toFixed(2)}</strong>
          </div>

          <div>
            <span>Delivery</span>

            <strong>5 - 7 Working Days</strong>
          </div>
        </div>

        {/* PRODUCTS */}

        <div className="success-products">
          <h2>
            <FiPackage />
            Ordered Items
          </h2>

          {items.map((item) => {
            const itemTotal =
              Number(item.price || 0) * Number(item.quantity || 0);

            return (
              <div className="success-product" key={item.id}>
                <div className="product-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name || "Product"} />
                  ) : (
                    <div>No Image</div>
                  )}
                </div>

                <div className="product-info">
                  <h3>{item.name || "Product"}</h3>

                  <p>Quantity: {item.quantity}</p>

                  <p>Price: ₹{Number(item.price || 0).toFixed(2)}</p>
                </div>

                <strong>₹{itemTotal.toFixed(2)}</strong>
              </div>
            );
          })}
        </div>

        {/* SHIPPING ADDRESS */}

        <div className="success-address">
          <h2>Delivery Address</h2>

          <p>
            <strong>{address.name || ""}</strong>
          </p>

          <p>{address.address || ""}</p>

          <p>
            {address.city || ""}
            {address.city && address.state ? ", " : ""}
            {address.state || ""} {address.pincode || ""}
          </p>

          {address.phone && <p>Phone: {address.phone}</p>}
        </div>

        {/* ACTIONS */}

        <div className="success-actions">
          <button className="primary-btn" onClick={() => navigate("/orders")}>
            <FiPackage />
            View My Orders
          </button>

          <button className="secondary-btn" onClick={downloadInvoice}>
            <FiDownload />
            Download Invoice
          </button>

          <button
            className="secondary-btn"
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

export default OrderSuccess;
