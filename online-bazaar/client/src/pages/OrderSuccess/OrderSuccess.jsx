import "./OrderSuccess.css";
import CheckoutSteps from "../../components/CheckoutSteps/CheckoutSteps";

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  FiCheck,
  FiCheckCircle,
  FiShoppingBag,
  FiPackage,
  FiDownload,
  FiMapPin,
  FiCreditCard,
  FiArrowRight,
  FiTruck,
  FiCalendar,
  FiHome,
  FiShield,
  FiArrowLeft,
  FiRefreshCw,
} from "react-icons/fi";

import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetchCartCount } = useAuth();
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const verificationStarted = useRef(false);

  const codOrder = location.state?.order;
  const codOrderId = location.state?.orderId;
  const codPaymentMethod = location.state?.paymentMethod;

  const isCODOrder =
    codPaymentMethod === "COD" || codOrder?.payment_method === "COD";

  const queryCashfreeOrderId = searchParams.get("order_id");

  const cashfreeOrderId =
    queryCashfreeOrderId || localStorage.getItem("cashfreeOrderId");

  // Verify Cashfree payment
  const verifyPayment = async () => {
    if (!cashfreeOrderId) {
      setVerificationError(true);
      setLoading(false);
      toast.error("Cashfree order ID is missing.");
      return;
    }

    try {
      setVerifying(true);
      setVerificationError(false);
      setPaymentResult(null);

      const response = await fetch(
        `${VITE_API_URL}/api/orders/verify-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({ cashfreeOrderId }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success && data.paymentStatus === "paid") {
        if (!data.order) {
          throw new Error(
            "Payment successful but order details could not be loaded.",
          );
        }

        setOrder(data.order);
        setPaymentResult("paid");

        if (user?.id) {
          await fetchCartCount(user.id);
        }

        if (data.orderId) {
          localStorage.setItem("orderId", String(data.orderId));
        }

        localStorage.removeItem("cashfreeOrderId");
        toast.success("Payment successful!");
        return;
      }

      if (response.status === 202 && data.paymentStatus === "pending") {
        setPaymentResult("pending");
        toast.info(
          data.message ||
            "Payment is still processing. Please check My Orders shortly.",
        );
        return;
      }

      if (data.paymentStatus === "not_attempted") {
        setPaymentResult("not_attempted");
        localStorage.removeItem("cashfreeOrderId");
        toast.info(data.message || "Payment was not completed.");
        return;
      }

      if (data.paymentStatus === "cancelled") {
        setPaymentResult("cancelled");
        localStorage.removeItem("cashfreeOrderId");
        toast.info(data.message || "Payment was cancelled.");
        return;
      }

      if (data.paymentStatus === "failed") {
        setPaymentResult("failed");
        localStorage.removeItem("cashfreeOrderId");
        toast.error(data.message || "Payment failed.");
        return;
      }

      setVerificationError(true);
      toast.error(data.message || "Unable to verify payment.");
    } catch (error) {
      console.error("Payment Verification Error:", error);
      setVerificationError(true);
      toast.error(error.message || "Unable to verify payment.");
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  // Initialize COD order or verify online payment
  useEffect(() => {
    window.scrollTo(0, 0);

    const initializeOrder = async () => {
      if (isCODOrder && codOrder) {
        setOrder(codOrder);

        if (user?.id) {
          await fetchCartCount(user.id);
        }

        setLoading(false);
        setVerifying(false);

        localStorage.setItem(
          "orderId",
          String(codOrderId || codOrder.id || ""),
        );

        return;
      }

      if (verificationStarted.current) return;

      verificationStarted.current = true;
      await verifyPayment();
    };

    initializeOrder();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCODOrder, codOrder, codOrderId]);

  // Download invoice
  const downloadInvoice = async () => {
    if (!order?.id) {
      toast.error("Order ID is not available.");
      return;
    }

    try {
      const response = await fetch(
        `${VITE_API_URL}/api/orders/${order.id}/invoice`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
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
      link.download = `Online-Bazaar-Invoice-${order.id}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
      toast.success("Invoice downloaded successfully.");
    } catch (error) {
      console.error("Invoice Error:", error);
      toast.error("Unable to download invoice.");
    }
  };

  const retryVerification = () => {
    verificationStarted.current = false;
    setLoading(true);
    setVerificationError(false);
    verifyPayment();
  };

  // Loading screen
  if (loading || verifying) {
    return (
      <section className="order-success-page">
        <div className="os-loading-card">
          <div className="os-loading-symbol">
            <FiShield />
          </div>

          <span className="os-eyebrow">ONLINE BAZAAR · SECURE CHECKOUT</span>
          <h1>Confirming your order</h1>
          <p>
            Please wait while we verify your payment and prepare your order
            details.
          </p>

          {cashfreeOrderId && (
            <div className="os-reference-box">
              <span>Payment reference</span>
              <strong>{cashfreeOrderId}</strong>
            </div>
          )}

          <div className="os-spinner" />
          <span className="os-loading-caption">
            This may take a few moments
          </span>
        </div>
      </section>
    );
  }

  // Payment failed, cancelled, pending, or unconfirmed
  if (!order) {
    const isNotAttempted = paymentResult === "not_attempted";
    const isCancelled = paymentResult === "cancelled";
    const isFailed = paymentResult === "failed";
    const isPending = paymentResult === "pending";

    const problemTitle = isNotAttempted
      ? "Payment wasn't completed"
      : isCancelled
        ? "Payment was cancelled"
        : isFailed
          ? "Payment failed"
          : isPending
            ? "Payment is processing"
            : verificationError
              ? "We couldn't confirm your order"
              : "Payment status unavailable";

    const problemDescription = isNotAttempted
      ? "You left the payment page before completing your payment. Your order has not been confirmed."
      : isCancelled
        ? "The payment was cancelled. Please check your order history before placing another order."
        : isFailed
          ? "Your payment could not be completed. You can return to your orders and check the latest status."
          : isPending
            ? "Your payment may still be processing. Please wait a little and check My Orders before trying again."
            : verificationError
              ? "We couldn't confirm your payment right now. Please check My Orders before making another payment."
              : "We couldn't determine the current payment status. Please check your order history.";

    return (
      <section className="order-success-page">
        <div className="os-problem-card">
          <div
            className={`os-problem-symbol ${isFailed || isCancelled ? "warning" : ""}`}
          >
            {isPending ? <FiRefreshCw /> : <FiCreditCard />}
          </div>

          <span className="os-eyebrow">
            {isNotAttempted
              ? "PAYMENT NOT COMPLETED"
              : isCancelled
                ? "PAYMENT CANCELLED"
                : isFailed
                  ? "PAYMENT FAILED"
                  : isPending
                    ? "PAYMENT PROCESSING"
                    : "ORDER STATUS"}
          </span>

          <h1>{problemTitle}</h1>
          <p>{problemDescription}</p>

          {cashfreeOrderId && (
            <div className="os-reference-box">
              <span>Payment reference</span>
              <strong>{cashfreeOrderId}</strong>
            </div>
          )}

          <div className="os-problem-actions">
            {isPending || verificationError ? (
              <button
                type="button"
                className="os-btn os-btn-primary"
                onClick={retryVerification}
              >
                <FiRefreshCw />
                Check Payment Again
              </button>
            ) : null}

            <button
              type="button"
              className="os-btn os-btn-primary"
              onClick={() => navigate("/orders")}
            >
              <FiPackage />
              View My Orders
              <FiArrowRight />
            </button>

            <button
              type="button"
              className="os-btn os-btn-secondary"
              onClick={() => navigate("/products")}
            >
              <FiShoppingBag />
              Continue Shopping
            </button>
          </div>

          <button
            type="button"
            className="os-back-link"
            onClick={() => navigate("/")}
          >
            <FiArrowLeft />
            Back to Online Bazaar
          </button>
        </div>
      </section>
    );
  }

  // Order information
  const publicOrderId = order.public_order_id || order.id || "Order";
  const paymentMethod = order.payment_method || codPaymentMethod || "ONLINE";
  const isCOD = String(paymentMethod).toUpperCase() === "COD";
  const totalAmount = Number(order.total_amount || 0);
  const items = Array.isArray(order.items) ? order.items : [];
  const address = order.shipping_address || {};

  const formatDate = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "To be confirmed";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getEstimatedDelivery = (orderDate) => {
    const start = new Date(orderDate);

    if (Number.isNaN(start.getTime())) return "To be confirmed";

    start.setDate(start.getDate() + 5);

    const end = new Date(orderDate);
    end.setDate(end.getDate() + 7);

    const formatShortDate = (date) =>
      date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });

    return `${formatShortDate(start)} – ${formatShortDate(end)}`;
  };

  const estimatedDelivery = getEstimatedDelivery(order.created_at);
  const paymentStatus = isCOD
    ? "Pay on Delivery"
    : order.payment_status || "Paid";

  return (
    <section className="order-success-page">
      <div className="os-wrapper">
        <button
          type="button"
          className="os-back-link os-top-back"
          onClick={() => navigate("/products")}
        >
          <FiArrowLeft />
          Continue browsing
        </button>

        <div className="os-checkout-steps">
          <CheckoutSteps currentStep={3} />
        </div>

        {/* Success hero */}
        <header className="os-hero">
          <div className="os-success-icon">
            <FiCheck />
            <span className="os-success-sparkle">✦</span>
          </div>

          <span className="os-eyebrow">
            {isCOD ? "ORDER CONFIRMED" : "PAYMENT CONFIRMED"}
          </span>

          <h1>
            Thank you for
            <br />
            <span>shopping with us.</span>
          </h1>

          <p>
            {isCOD
              ? "Your order has been placed successfully. We'll get everything ready for delivery."
              : "Your payment has been received successfully. We're getting your order ready."}
          </p>

          <div className="os-hero-note">
            <FiCheckCircle />
            <span>
              {isCOD
                ? "Your Cash on Delivery order is confirmed"
                : "Your online payment is confirmed"}
            </span>
          </div>
        </header>

        {/* Order reference */}
        <div className="os-order-reference">
          <div className="os-order-reference-left">
            <div className="os-reference-icon">
              <FiPackage />
            </div>

            <div>
              <span className="os-label">YOUR ORDER NUMBER</span>
              <h2>#{publicOrderId}</h2>
              <p>Placed on {formatDate(order.created_at || new Date())}</p>
            </div>
          </div>

          <div className={`os-payment-pill ${isCOD ? "cod" : "paid"}`}>
            <span />
            {isCOD ? "Pay on delivery" : "Payment successful"}
          </div>
        </div>

        {/* Order highlights */}
        <div className="os-highlights">
          <article className="os-highlight-card os-delivery-highlight">
            <div className="os-highlight-top">
              <span className="os-highlight-icon">
                <FiTruck />
              </span>
              <span className="os-highlight-label">ESTIMATED DELIVERY</span>
            </div>
            <strong>{estimatedDelivery}</strong>
            <span className="os-highlight-caption">We'll keep you updated</span>
          </article>

          <article className="os-highlight-card">
            <div className="os-highlight-top">
              <span className="os-highlight-icon">
                <FiCreditCard />
              </span>
              <span className="os-highlight-label">PAYMENT METHOD</span>
            </div>
            <strong>{isCOD ? "Cash on Delivery" : "Online Payment"}</strong>
            <span className="os-highlight-caption">{paymentStatus}</span>
          </article>

          <article className="os-highlight-card">
            <div className="os-highlight-top">
              <span className="os-highlight-icon">
                <FiShoppingBag />
              </span>
              <span className="os-highlight-label">YOUR PURCHASE</span>
            </div>
            <strong>
              {items.length} {items.length === 1 ? "item" : "items"}
            </strong>
            <span className="os-highlight-caption">
              Total ₹{totalAmount.toFixed(2)}
            </span>
          </article>
        </div>

        {/* Main order details */}
        <div className="os-content-grid">
          <div className="os-main-column">
            {/* Products */}
            <section className="os-panel">
              <div className="os-panel-heading">
                <div>
                  <span className="os-label">INSIDE YOUR ORDER</span>
                  <h2>Items purchased</h2>
                  <p>Here's what you've ordered.</p>
                </div>

                <span className="os-panel-heading-icon">
                  <FiShoppingBag />
                </span>
              </div>

              <div className="os-items-list">
                {items.length > 0 ? (
                  items.map((item, index) => {
                    const quantity = Number(item.quantity || 0);
                    const price = Number(item.price || 0);
                    const itemTotal = price * quantity;

                    return (
                      <article
                        className="os-product-item"
                        key={item.id || `${item.name}-${index}`}
                      >
                        <div className="os-product-image">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name || "Product"}
                            />
                          ) : (
                            <FiShoppingBag />
                          )}
                        </div>

                        <div className="os-product-details">
                          <h3>{item.name || "Product"}</h3>
                          <span>Quantity: {quantity}</span>
                          <span>₹{price.toFixed(2)} each</span>
                        </div>

                        <strong className="os-product-total">
                          ₹{itemTotal.toFixed(2)}
                        </strong>
                      </article>
                    );
                  })
                ) : (
                  <div className="os-empty-items">
                    <FiShoppingBag />
                    <p>No order items were returned.</p>
                  </div>
                )}
              </div>

              <div className="os-items-footer">
                <span>Order total</span>
                <strong>₹{totalAmount.toFixed(2)}</strong>
              </div>
            </section>

            {/* Address */}
            <section className="os-panel">
              <div className="os-panel-heading">
                <div>
                  <span className="os-label">WHERE IT'S GOING</span>
                  <h2>Delivery address</h2>
                  <p>Your order will be delivered here.</p>
                </div>

                <span className="os-panel-heading-icon">
                  <FiMapPin />
                </span>
              </div>

              <div className="os-address-content">
                <div className="os-address-icon">
                  <FiHome />
                </div>

                <div className="os-address-details">
                  <h3>{address.fullName || address.name || "Customer"}</h3>

                  {address.address && <p>{address.address}</p>}

                  {(address.city || address.state || address.pincode) && (
                    <p>
                      {address.city || ""}
                      {address.city && address.state ? ", " : ""}
                      {address.state || ""}
                      {address.pincode ? ` ${address.pincode}` : ""}
                    </p>
                  )}

                  {address.phone && (
                    <span className="os-address-phone">
                      Phone: {address.phone}
                    </span>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Summary sidebar */}
          <aside className="os-sidebar">
            <section className="os-summary-panel">
              <div className="os-summary-heading">
                <span className="os-label">THE BREAKDOWN</span>
                <h2>Order summary</h2>
              </div>

              <div className="os-summary-content">
                <div className="os-summary-row">
                  <span>Number of items</span>
                  <strong>{items.length}</strong>
                </div>

                <div className="os-summary-row">
                  <span>Payment method</span>
                  <strong>{isCOD ? "COD" : "Online"}</strong>
                </div>

                <div className="os-summary-row">
                  <span>Payment status</span>
                  <strong className={isCOD ? "os-cod-text" : "os-paid-text"}>
                    {isCOD ? "On delivery" : "Paid"}
                  </strong>
                </div>

                <div className="os-summary-divider" />

                <div className="os-summary-total">
                  <div>
                    <span>Total amount</span>
                    <small>
                      {isCOD
                        ? "Pay when your order arrives"
                        : "Payment securely confirmed"}
                    </small>
                  </div>
                  <strong>₹{totalAmount.toFixed(2)}</strong>
                </div>
              </div>

              <div className="os-payment-message">
                <span className="os-payment-message-icon">
                  {isCOD ? <FiTruck /> : <FiCheckCircle />}
                </span>

                <div>
                  <strong>
                    {isCOD ? "Pay when it arrives" : "You're all set!"}
                  </strong>
                  <p>
                    {isCOD
                      ? "Please pay the delivery partner when your order arrives."
                      : "Your payment has been successfully confirmed."}
                  </p>
                </div>
              </div>
            </section>

            <section className="os-delivery-card">
              <div className="os-delivery-card-icon">
                <FiCalendar />
              </div>

              <div>
                <span className="os-label">EXPECTED ARRIVAL</span>
                <strong>{estimatedDelivery}</strong>
                <p>Estimated delivery window</p>
              </div>
            </section>

            <div className="os-trust-note">
              <FiShield />
              <span>Your order details are handled securely.</span>
            </div>
          </aside>
        </div>

        {/* Actions */}
        <div className="os-actions">
          <button
            type="button"
            className="os-btn os-btn-primary"
            onClick={() => navigate("/orders")}
          >
            <FiPackage />
            View My Orders
            <FiArrowRight />
          </button>

          <button
            type="button"
            className="os-btn os-btn-secondary"
            onClick={downloadInvoice}
          >
            <FiDownload />
            Download Invoice
          </button>

          <button
            type="button"
            className="os-btn os-btn-secondary"
            onClick={() => navigate("/products")}
          >
            <FiShoppingBag />
            Continue Shopping
          </button>
        </div>

        {/* Footer */}
        <footer className="os-footer">
          <span className="os-footer-mark">
            <FiCheck />
          </span>

          <p>
            Thank you for choosing <strong>Online Bazaar</strong>.
            <br />
            <span>Good finds. Great value. Every day.</span>
          </p>
        </footer>
      </div>
    </section>
  );
}

export default OrderSuccess;
