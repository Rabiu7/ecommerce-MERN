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
} from "react-icons/fi";

import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetchCartCount } = useAuth();
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(false);

  const verificationStarted = useRef(false);

  // =====================================================
  // COD ORDER DATA
  // =====================================================

  const codOrder = location.state?.order;
  const codOrderId = location.state?.orderId;
  const codPaymentMethod = location.state?.paymentMethod;

  const isCODOrder =
    codPaymentMethod === "COD" || codOrder?.payment_method === "COD";

  // =====================================================
  // CASHFREE ORDER ID
  // =====================================================

  const queryCashfreeOrderId = searchParams.get("order_id");

  const cashfreeOrderId =
    queryCashfreeOrderId || localStorage.getItem("cashfreeOrderId");

  // =====================================================
  // VERIFY CASHFREE PAYMENT
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
        console.log("Payment successful");

        if (!data.order) {
          throw new Error(
            "Payment successful but order details could not be loaded.",
          );
        }

        setOrder(data.order);

        // Refresh cart count only after payment/order is confirmed
        if (user?.id) {
          await fetchCartCount(user.id);
        }

        if (data.orderId) {
          localStorage.setItem("orderId", String(data.orderId));
        }

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
  // INITIALIZE ORDER
  // =====================================================

  useEffect(() => {
    window.scrollTo(0, 0);

    const initializeOrder = async () => {
      // -----------------------------------------------
      // COD
      // -----------------------------------------------

      if (isCODOrder && codOrder) {
        console.log("COD order detected");

        setOrder(codOrder);

        // Backend clears the cart after successful COD order placement
        if (user?.id) {
          await fetchCartCount(user.id);
        }

        setLoading(false);
        setVerifying(false);

        localStorage.setItem("orderId", String(codOrderId || codOrder.id));

        return;
      }

      // -----------------------------------------------
      // ONLINE PAYMENT
      // -----------------------------------------------

      if (verificationStarted.current) {
        return;
      }

      verificationStarted.current = true;

      await verifyPayment();
    };

    initializeOrder();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCODOrder, codOrder, codOrderId]);

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
        <div className="success-loading-card">
          <div className="success-loading-icon">
            <FiShield />
          </div>

          <span className="success-eyebrow">SECURE CHECKOUT</span>

          <h1>Confirming Your Order</h1>

          <p>Please wait while we securely confirm your order details.</p>

          {cashfreeOrderId && (
            <div className="loading-reference">
              <span>Payment Reference</span>
              <strong>{cashfreeOrderId}</strong>
            </div>
          )}

          <div className="success-spinner" />
        </div>
      </section>
    );
  }

  // =====================================================
  // PAYMENT / ORDER NOT CONFIRMED
  // =====================================================

  if (!order) {
    return (
      <section className="order-success-page">
        <div className="order-problem-card">
          <div className="problem-icon">
            <FiCreditCard />
          </div>

          <span className="success-eyebrow">ORDER STATUS</span>

          <h1>
            {verificationError
              ? "We Couldn't Confirm Your Order"
              : "Your Payment Is Processing"}
          </h1>

          <p>
            {verificationError
              ? "We couldn't confirm your payment right now. Please check your order history before trying again."
              : "Your payment may still be processing. Please check your order history after a few moments."}
          </p>

          <div className="problem-actions">
            <button
              type="button"
              className="success-primary-btn"
              onClick={() => navigate("/orders")}
            >
              <FiPackage />
              View My Orders
              <FiArrowRight />
            </button>

            <button
              type="button"
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

  const publicOrderId = order?.public_order_id || "Order";

  const paymentMethod = order.payment_method || codPaymentMethod || "ONLINE";

  const isCOD = paymentMethod === "COD";

  const totalAmount = Number(order.total_amount || 0);

  const items = Array.isArray(order.items) ? order.items : [];

  const address = order.shipping_address || {};

  // =====================================================
  // ESTIMATED DELIVERY
  // =====================================================

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
  // PAYMENT LABEL
  // =====================================================

  const paymentStatus = isCOD
    ? "Pay on Delivery"
    : order.payment_status || "Paid";

  // =====================================================
  // SUCCESS PAGE
  // =====================================================

  return (
    <section className="order-success-page">
      <div className="success-wrapper">
        {/* =================================================
              STEP PROGRESS
          ================================================= */}

        <CheckoutSteps currentStep={3} />

        {/* =================================================
              HERO
          ================================================= */}

        <div className="success-hero">
          <div className="success-hero-icon">
            <FiCheck />
          </div>

          <span className="success-eyebrow">
            {isCOD ? "ORDER CONFIRMED" : "PAYMENT CONFIRMED"}
          </span>

          <h1>Your order is on its way</h1>

          <p>
            {isCOD
              ? "Thank you for shopping with HomeNeeds. Your Cash on Delivery order has been successfully placed."
              : "Thank you for shopping with HomeNeeds. Your payment has been successfully received and your order is being prepared."}
          </p>
        </div>

        {/* =================================================
              ORDER REFERENCE
          ================================================= */}

        <div className="order-reference-card">
          <div className="order-reference-main">
            <span>ORDER NUMBER</span>

            <h2>#{publicOrderId}</h2>
          </div>

          <div className={isCOD ? "order-status cod" : "order-status paid"}>
            <span className="status-dot" />

            {isCOD ? "Payment on Delivery" : "Payment Confirmed"}
          </div>
        </div>

        {/* =================================================
              QUICK ORDER INFO
          ================================================= */}

        <div className="order-info-grid">
          <div className="order-info-card">
            <div className="order-info-icon">
              <FiTruck />
            </div>

            <div>
              <span>DELIVERY</span>

              <strong>{estimatedDelivery}</strong>

              <small>Estimated delivery</small>
            </div>
          </div>

          <div className="order-info-card">
            <div className="order-info-icon">
              <FiCreditCard />
            </div>

            <div>
              <span>PAYMENT</span>

              <strong>{isCOD ? "Cash on Delivery" : "Online Payment"}</strong>

              <small>{paymentStatus}</small>
            </div>
          </div>

          <div className="order-info-card">
            <div className="order-info-icon">
              <FiShoppingBag />
            </div>

            <div>
              <span>TOTAL</span>

              <strong>₹{totalAmount.toFixed(2)}</strong>

              <small>
                {items.length} {items.length === 1 ? "item" : "items"}
              </small>
            </div>
          </div>
        </div>

        {/* =================================================
              MAIN CONTENT
          ================================================= */}

        <div className="success-content-grid">
          {/* =============================================
                LEFT
            ============================================= */}

          <div className="success-main-column">
            {/* ORDER ITEMS */}

            <div className="success-card">
              <div className="success-card-header">
                <div>
                  <span className="success-card-eyebrow">YOUR PURCHASE</span>

                  <h2>Ordered Items</h2>
                </div>

                <div className="success-card-header-icon">
                  <FiPackage />
                </div>
              </div>

              <div className="ordered-items">
                {items.length > 0 ? (
                  items.map((item) => {
                    const itemTotal =
                      Number(item.price || 0) * Number(item.quantity || 0);

                    return (
                      <div className="ordered-item" key={item.id}>
                        <div className="ordered-item-image">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name || "Product"}
                            />
                          ) : (
                            <FiShoppingBag />
                          )}
                        </div>

                        <div className="ordered-item-details">
                          <h3>{item.name || "Product"}</h3>

                          <span>Quantity: {item.quantity}</span>

                          <span>
                            Unit Price: ₹{Number(item.price || 0).toFixed(2)}
                          </span>
                        </div>

                        <strong className="ordered-item-total">
                          ₹{itemTotal.toFixed(2)}
                        </strong>
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

            {/* SHIPPING ADDRESS */}

            <div className="success-card">
              <div className="success-card-header">
                <div>
                  <span className="success-card-eyebrow">DELIVERY DETAILS</span>

                  <h2>Shipping Address</h2>
                </div>

                <div className="success-card-header-icon">
                  <FiMapPin />
                </div>
              </div>

              <div className="shipping-address">
                <div className="shipping-address-icon">
                  <FiHome />
                </div>

                <div>
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
          </div>

          {/* =============================================
                RIGHT SUMMARY
            ============================================= */}

          <aside className="success-side-column">
            <div className="success-summary-card">
              <div className="success-summary-header">
                <div>
                  <span>ORDER DETAILS</span>

                  <h2>Order Summary</h2>
                </div>

                <FiPackage />
              </div>

              <div className="success-summary-body">
                <div className="success-summary-row">
                  <span>Items</span>

                  <strong>{items.length}</strong>
                </div>

                <div className="success-summary-row">
                  <span>Payment</span>

                  <strong>{isCOD ? "COD" : "Online"}</strong>
                </div>

                <div className="success-summary-divider" />

                <div className="success-total">
                  <div>
                    <span>Total Amount</span>

                    <small>
                      {isCOD
                        ? "Pay when your order arrives"
                        : "Payment completed securely"}
                    </small>
                  </div>

                  <strong>₹{totalAmount.toFixed(2)}</strong>
                </div>
              </div>

              {/* PAYMENT STATUS */}

              <div className="payment-status-box">
                <div className="payment-status-icon">
                  {isCOD ? <FiTruck /> : <FiCheckCircle />}
                </div>

                <div>
                  <strong>
                    {isCOD ? "Cash on Delivery" : "Payment Successful"}
                  </strong>

                  <span>
                    {isCOD
                      ? "Please pay the delivery partner when your order arrives."
                      : "Your payment has been successfully confirmed."}
                  </span>
                </div>
              </div>
            </div>

            {/* DELIVERY NOTE */}

            <div className="delivery-note">
              <div className="delivery-note-icon">
                <FiCalendar />
              </div>

              <div>
                <strong>Estimated Delivery</strong>

                <span>{estimatedDelivery}</span>
              </div>
            </div>
          </aside>
        </div>

        {/* =================================================
              ACTIONS
          ================================================= */}

        <div className="success-actions">
          <button
            type="button"
            className="success-primary-btn"
            onClick={() => navigate("/orders")}
          >
            <FiPackage />
            View My Orders
            <FiArrowRight />
          </button>

          <button
            type="button"
            className="success-secondary-btn"
            onClick={downloadInvoice}
          >
            <FiDownload />
            Download Invoice
          </button>

          <button
            type="button"
            className="success-secondary-btn"
            onClick={() => navigate("/products")}
          >
            <FiShoppingBag />
            Continue Shopping
          </button>
        </div>

        {/* =================================================
              FOOTER
          ================================================= */}

        <div className="success-footer">
          <FiShield />

          <span>
            Thank you for choosing
            <strong> HomeNeeds</strong>.
          </span>
        </div>
      </div>
    </section>
  );
}

export default OrderSuccess;
