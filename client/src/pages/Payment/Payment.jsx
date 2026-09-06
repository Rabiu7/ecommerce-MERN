import "./Payment.css";
import CheckoutSteps from "../../components/CheckoutSteps/CheckoutSteps";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FiSmartphone,
  FiTruck,
  FiCheckCircle,
  FiArrowLeft,
  FiShield,
  FiMapPin,
  FiCreditCard,
} from "react-icons/fi";

import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  const [cashfreeReady, setCashfreeReady] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [processing, setProcessing] = useState(false);

  const {
    amount = 0,
    subtotal = 0,
    gst = 0,
    shipping = 0,
    address = {},
    cartItems = [],
    buyNow = false,
  } = location.state || {};

  // =====================================================
  // LOAD CASHFREE SDK
  // =====================================================

  useEffect(() => {
    if (window.Cashfree) {
      console.log("Cashfree SDK already available");
      setCashfreeReady(true);
      return;
    }

    const existingScript = document.querySelector("#cashfree-sdk");

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        console.log("Cashfree SDK loaded");
        setCashfreeReady(true);
      });

      return;
    }

    const script = document.createElement("script");

    script.id = "cashfree-sdk";
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;

    script.onload = () => {
      console.log("Cashfree SDK loaded");
      setCashfreeReady(true);
    };

    script.onerror = () => {
      console.error("Cashfree SDK failed to load");
      toast.error("Unable to load Cashfree payment gateway.");
    };

    document.body.appendChild(script);
  }, []);

  // =====================================================
  // HANDLE COD
  // =====================================================

  const handleCOD = async () => {
    try {
      setProcessing(true);

      const response = await fetch(`${VITE_API_URL}/api/orders/checkout`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },

        body: JSON.stringify({
          payment_method: "COD",

          shipping_address: address,

          buy_now: buyNow,

          buy_now_product_id: buyNow ? cartItems[0]?.product_id : null,

          buy_now_quantity: buyNow ? Number(cartItems[0]?.quantity || 1) : null,

          customer: {
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || address?.phone || "",
          },
        }),
      });

      const data = await response.json();

      console.log("COD response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Unable to place order");
      }

      toast.success("Order placed successfully 🎉");

      navigate("/order-success", {
        replace: true,

        state: {
          orderId: data.orderId,
          totalAmount: data.totalAmount,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          orderStatus: data.orderStatus,
          shippingAddress: data.shippingAddress,
          order: data.order,
        },
      });
    } catch (error) {
      console.error("COD Error:", error);

      toast.error(error.message || "Unable to place order");
    } finally {
      setProcessing(false);
    }
  };

  // =====================================================
  // CREATE CASHFREE ORDER
  // =====================================================

  const createCashfreeOrder = async () => {
    const response = await fetch(`${VITE_API_URL}/api/orders/checkout`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },

      body: JSON.stringify({
        payment_method: "ONLINE",

        shipping_address: address,

        buy_now: buyNow,

        buy_now_product_id: buyNow ? cartItems[0]?.product_id : null,

        buy_now_quantity: buyNow ? Number(cartItems[0]?.quantity || 1) : null,

        customer: {
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || address?.phone || "",
        },
      }),
    });

    const data = await response.json();

    console.log("Backend Cashfree response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Unable to create Cashfree order");
    }

    return data;
  };

  // =====================================================
  // OPEN CASHFREE CHECKOUT
  // =====================================================

  const handleOnlinePayment = async () => {
    try {
      setProcessing(true);

      console.log("=================================");
      console.log("1️⃣ Online payment started");
      console.log("=================================");

      if (!cashfreeReady || !window.Cashfree) {
        toast.error(
          "Cashfree payment gateway is still loading. Please try again.",
        );

        setProcessing(false);

        return;
      }

      console.log("2️⃣ Cashfree SDK is ready");

      const orderData = await createCashfreeOrder();

      console.log("3️⃣ Backend order response:", orderData);

      if (!orderData.paymentSessionId) {
        throw new Error("Cashfree payment session was not created");
      }

      console.log("4️⃣ Payment Session ID:", orderData.paymentSessionId);

      if (orderData.cashfreeOrderId) {
        localStorage.setItem("cashfreeOrderId", orderData.cashfreeOrderId);

        console.log("Cashfree Order ID:", orderData.cashfreeOrderId);
      }

      const cashfreeMode = import.meta.env.VITE_CASHFREE_MODE || "sandbox";

      console.log("Cashfree Mode:", cashfreeMode);

      const cashfree = window.Cashfree({
        mode: cashfreeMode,
      });

      console.log("5️⃣ Cashfree initialized");

      const checkoutOptions = {
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: "_self",
        mode: cashfreeMode,
      };

      console.log("6️⃣ Opening Cashfree with:", checkoutOptions);

      const result = await cashfree.checkout(checkoutOptions);

      console.log("7️⃣ Cashfree checkout result:", result);

      if (result?.error) {
        console.error("Cashfree Checkout Error:", result.error);

        toast.error(result.error.message || "Unable to open Cashfree checkout");

        setProcessing(false);

        return;
      }

      if (result?.warning) {
        console.warn("Cashfree Checkout Warning:", result.warning);
      }
    } catch (error) {
      console.error("❌ Cashfree Payment Error:", error);

      toast.error(error.message || "Unable to start payment");

      setProcessing(false);
    }
  };

  // =====================================================
  // MAIN PAYMENT HANDLER
  // =====================================================

  const handlePayment = async () => {
    if (processing) {
      return;
    }

    if (paymentMethod === "COD") {
      await handleCOD();
      return;
    }

    await handleOnlinePayment();
  };

  // =====================================================
  // BACK TO CHECKOUT
  // =====================================================

  const goBackToCheckout = () => {
    if (processing) return;

    navigate("/checkout", {
      state: {
        address,
        cartItems,
        buyNow,
      },
    });
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="payment-page">
      <div className="payment-container">
        {/* =================================================
            TOP HEADER
        ================================================= */}

        <div className="payment-topbar">
          <button
            type="button"
            className="payment-back-btn"
            onClick={goBackToCheckout}
            disabled={processing}
          >
            <FiArrowLeft />
            Back to Checkout
          </button>
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="payment-header">
          <span className="payment-eyebrow">SECURE CHECKOUT</span>

          <h1>Complete Your Payment</h1>

          <p>
            Choose your preferred payment method and securely complete your
            order.
          </p>
        </div>

        {/* =================================================
            CHECKOUT STEPS
        ================================================= */}

        <CheckoutSteps currentStep={2} />

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="payment-grid">
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="payment-left">
            {/* DELIVERY CARD */}

            <div className="delivery-preview-card">
              <div className="card-heading">
                <div>
                  <span className="card-eyebrow">DELIVERY</span>

                  <h2>Shipping Address</h2>
                </div>

                <FiMapPin />
              </div>

              <div className="delivery-details">
                <strong>{address.fullName || user?.name}</strong>

                <p>{address.address}</p>

                <p>
                  {address.city}, {address.state} - {address.pincode}
                </p>

                <p className="delivery-phone">
                  <FiSmartphone />
                  {address.phone || user?.phone}
                </p>
              </div>

              <button
                type="button"
                className="change-address-btn"
                onClick={goBackToCheckout}
                disabled={processing}
              >
                Change Address
              </button>
            </div>

            {/* PAYMENT METHODS */}

            <div className="payment-card">
              <div className="card-heading">
                <div>
                  <span className="card-eyebrow">PAYMENT</span>

                  <h2>Select Payment Method</h2>
                </div>

                <FiCreditCard />
              </div>

              {/* ONLINE PAYMENT */}

              <button
                type="button"
                className={
                  paymentMethod === "ONLINE"
                    ? "payment-option active"
                    : "payment-option"
                }
                onClick={() => !processing && setPaymentMethod("ONLINE")}
                disabled={processing}
              >
                <div className="payment-option-icon">
                  <FiSmartphone />
                </div>

                <div className="payment-option-content">
                  <div className="payment-option-title">
                    <h4>Online Payment</h4>

                    <span className="recommended-badge">Recommended</span>
                  </div>

                  <p>UPI, Cards, Wallets, Netbanking & Pay Later</p>

                  <div className="payment-tags">
                    <span>UPI</span>
                    <span>Cards</span>
                    <span>Wallet</span>
                    <span>Netbanking</span>
                  </div>
                </div>

                <div className="payment-radio">
                  {paymentMethod === "ONLINE" && <FiCheckCircle />}
                </div>
              </button>

              {/* COD */}

              <button
                type="button"
                className={
                  paymentMethod === "COD"
                    ? "payment-option active"
                    : "payment-option"
                }
                onClick={() => !processing && setPaymentMethod("COD")}
                disabled={processing}
              >
                <div className="payment-option-icon">
                  <FiTruck />
                </div>

                <div className="payment-option-content">
                  <h4>Cash on Delivery</h4>

                  <p>Pay after your order is delivered</p>

                  <span className="cod-note">Available for this order</span>
                </div>

                <div className="payment-radio">
                  {paymentMethod === "COD" && <FiCheckCircle />}
                </div>
              </button>
            </div>

            {/* SECURITY */}

            <div className="payment-security">
              <div className="security-icon">
                <FiShield />
              </div>

              <div>
                <h4>Your payment is secure</h4>

                <p>
                  Your payment information is processed securely. We never store
                  your card details.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT COLUMN - ORDER SUMMARY
          ================================================= */}

          <aside className="payment-summary">
            <div className="summary-header">
              <div>
                <span className="card-eyebrow">YOUR ORDER</span>

                <h2>Order Summary</h2>
              </div>

              <span className="item-count">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* PRODUCTS */}

            <div className="payment-products">
              {cartItems.map((item) => (
                <div className="payment-product" key={item.id}>
                  <div className="payment-product-image">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="payment-product-info">
                    <h4>{item.name}</h4>

                    <p>Qty: {item.quantity}</p>
                  </div>

                  <strong>
                    ₹{(Number(item.price) * item.quantity).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>

            {/* PRICE BREAKDOWN */}

            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Subtotal</span>

                <strong>₹{Number(subtotal).toFixed(2)}</strong>
              </div>

              <div className="summary-row">
                <span>GST</span>

                <strong>₹{Number(gst).toFixed(2)}</strong>
              </div>

              <div className="summary-row">
                <span>Shipping</span>

                <strong className={Number(shipping) === 0 ? "free-text" : ""}>
                  {Number(shipping) === 0
                    ? "FREE"
                    : `₹${Number(shipping).toFixed(2)}`}
                </strong>
              </div>

              <div className="summary-row">
                <span>Payment Method</span>

                <strong>{paymentMethod === "ONLINE" ? "Online" : "COD"}</strong>
              </div>
            </div>

            {/* TOTAL */}

            <div className="payment-total">
              <div>
                <span>Total Amount</span>

                <small>Inclusive of applicable taxes</small>
              </div>

              <strong>₹{Number(amount).toFixed(2)}</strong>
            </div>

            {/* BUTTON */}

            <button
              type="button"
              className="pay-btn"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing
                ? "Processing..."
                : paymentMethod === "COD"
                  ? `Place COD Order • ₹${Number(amount).toFixed(2)}`
                  : `Continue to Cashfree • ₹${Number(amount).toFixed(2)}`}
            </button>

            <div className="payment-trust">
              <FiShield />

              <span>Secure & encrypted payment</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Payment;
