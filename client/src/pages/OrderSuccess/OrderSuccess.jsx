import "./OrderSuccess.css";

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

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

  const location = useLocation();

  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [verifying, setVerifying] = useState(false);

  const [verificationError, setVerificationError] = useState(false);

  // =====================================================
  // GET CASHFREE ORDER ID
  // =====================================================

  const queryCashfreeOrderId = searchParams.get("order_id");

  /*
   * Cashfree should send:
   *
   * /order-success?order_id=HN_73_1788008553308
   *
   * We also keep a localStorage fallback because
   * the browser may sometimes navigate/reload before
   * the query parameter is available to our React state.
   */

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
            cashfreeOrderId: cashfreeOrderId,
          }),
        },
      );

      const data = await response.json();

      console.log("Payment Verification Response:", data);

      // =================================================
      // SUCCESS
      // =================================================

      if (response.ok && data.success && data.paymentStatus === "paid") {
        console.log("✅ Payment successful");

        console.log("Local Order ID:", data.orderId);

        console.log("Cashfree Order ID:", data.cashfreeOrderId);

        console.log("Complete Order:", data.order);

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

        // Cashfree order is no longer needed
        // after successful verification.
        localStorage.removeItem("cashfreeOrderId");

        toast.success("Payment successful 🎉");

        return;
      }

      // =================================================
      // PENDING
      // =================================================

      if (response.status === 202 || data.paymentStatus === "pending") {
        console.log("⏳ Payment is still pending");

        toast.info(
          "Payment is still being processed. Please check My Orders after a few moments.",
        );

        return;
      }

      // =================================================
      // FAILED
      // =================================================

      if (data.paymentStatus === "failed") {
        console.log("❌ Payment failed");

        toast.error(data.message || "Payment failed.");

        return;
      }

      // =================================================
      // UNKNOWN
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
  // RUN VERIFICATION
  // =====================================================

  useEffect(() => {
    window.scrollTo(0, 0);

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

      /*
       * IMPORTANT:
       *
       * Your backend route is:
       *
       * GET /api/orders/:id/invoice
       *
       * :id is LOCAL ORDER ID.
       *
       * Therefore use order.id,
       * NOT cashfreeOrderId.
       */

      const url = `${VITE_API_URL}/api/orders/` + `${order.id}/invoice`;

      console.log("Downloading invoice:", url);

      const response = await fetch(url, {
        method: "GET",

        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();

        console.error("Invoice response:", errorData);

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
  // LOADING / VERIFYING
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
  // NO ORDER / PAYMENT PENDING
  // =====================================================

  if (!order) {
    return (
      <section className="order-success">
        <div className="success-container">
          <div className="success-icon">
            <FiCheckCircle />
          </div>

          <h1>
            {verificationError
              ? "Unable to Verify Payment"
              : "Payment Processing"}
          </h1>

          <p className="success-message">
            {verificationError
              ? "We could not confirm your payment right now. Please check My Orders before trying again."
              : "Your payment may still be processing. Please check My Orders after a few moments."}
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
