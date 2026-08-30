import "./Payment.css";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { FiSmartphone, FiTruck, FiCheckCircle } from "react-icons/fi";

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

      // COD doesn't go through Cashfree.
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

      // =================================================
      // CHECK SDK
      // =================================================

      if (!cashfreeReady || !window.Cashfree) {
        toast.error(
          "Cashfree payment gateway is still loading. Please try again.",
        );

        setProcessing(false);

        return;
      }

      console.log("2️⃣ Cashfree SDK is ready");

      // =================================================
      // CREATE BACKEND ORDER
      // =================================================

      const orderData = await createCashfreeOrder();

      console.log("3️⃣ Backend order response:", orderData);

      // =================================================
      // CHECK PAYMENT SESSION
      // =================================================

      if (!orderData.paymentSessionId) {
        throw new Error("Cashfree payment session was not created");
      }

      console.log("4️⃣ Payment Session ID:", orderData.paymentSessionId);

      // =================================================
      // SAVE CASHFREE ORDER ID
      // =================================================

      if (orderData.cashfreeOrderId) {
        localStorage.setItem("cashfreeOrderId", orderData.cashfreeOrderId);

        console.log("Cashfree Order ID:", orderData.cashfreeOrderId);
      }

      // =================================================
      // CASHFREE MODE
      // =================================================

      const cashfreeMode = import.meta.env.VITE_CASHFREE_MODE || "sandbox";

      console.log("Cashfree Mode:", cashfreeMode);

      // =================================================
      // INITIALIZE CASHFREE
      // =================================================

      const cashfree = window.Cashfree({
        mode: cashfreeMode,
      });

      console.log("5️⃣ Cashfree initialized");

      // =================================================
      // CHECKOUT OPTIONS
      // =================================================

      const checkoutOptions = {
        paymentSessionId: orderData.paymentSessionId,

        redirectTarget: "_self",

        mode: cashfreeMode,
      };

      console.log("6️⃣ Opening Cashfree with:", checkoutOptions);

      // =================================================
      // OPEN CHECKOUT
      // =================================================

      const result = await cashfree.checkout(checkoutOptions);

      console.log("7️⃣ Cashfree checkout result:", result);

      // =================================================
      // HANDLE SDK ERROR
      // =================================================

      if (result?.error) {
        console.error("Cashfree Checkout Error:", result.error);

        toast.error(result.error.message || "Unable to open Cashfree checkout");

        setProcessing(false);

        return;
      }

      // =================================================
      // CHECK SDK WARNING
      // =================================================

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
  // RENDER
  // =====================================================

  return (
    <section className="payment-page">
      <div className="payment-container">
        {/* HEADER */}

        <div className="payment-header">
          <h1>Payment</h1>

          <p>Complete your payment securely</p>
        </div>

        <div className="payment-grid">
          {/* ==========================================
              PAYMENT METHODS
          ========================================== */}

          <div className="payment-card">
            <h2>Select Payment Method</h2>

            {/* ONLINE */}

            <div
              className={
                paymentMethod === "ONLINE"
                  ? "payment-option active"
                  : "payment-option"
              }
              onClick={() => !processing && setPaymentMethod("ONLINE")}
            >
              <FiSmartphone />

              <div>
                <h4>Online Payment</h4>

                <p>UPI, Cards, Wallets, Netbanking & Pay Later</p>

                <div className="payment-tags">
                  <span>UPI</span>
                  <span>Cards</span>
                  <span>Wallet</span>
                  <span>Netbanking</span>
                </div>
              </div>

              {paymentMethod === "ONLINE" && (
                <FiCheckCircle className="payment-check" />
              )}
            </div>

            {/* COD */}

            <div
              className={
                paymentMethod === "COD"
                  ? "payment-option active"
                  : "payment-option"
              }
              onClick={() => !processing && setPaymentMethod("COD")}
            >
              <FiTruck />

              <div>
                <h4>Cash on Delivery</h4>

                <p>Pay after your order is delivered</p>
              </div>

              {paymentMethod === "COD" && (
                <FiCheckCircle className="payment-check" />
              )}
            </div>
          </div>

          {/* ==========================================
              SUMMARY
          ========================================== */}

          <div className="payment-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Items</span>

              <strong>{cartItems.length}</strong>
            </div>

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

              <strong>
                {Number(shipping) === 0
                  ? "FREE"
                  : `₹${Number(shipping).toFixed(2)}`}
              </strong>
            </div>

            <div className="summary-row">
              <span>Payment</span>

              <strong>
                {paymentMethod === "ONLINE"
                  ? "Online Payment"
                  : "Cash on Delivery"}
              </strong>
            </div>

            <div className="summary-row total">
              <span>Total</span>

              <strong>₹{Number(amount).toFixed(2)}</strong>
            </div>

            {/* PAYMENT BUTTON */}

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

            <div className="secure-box">
              <h4>Secure Checkout</h4>

              <p>✔ UPI</p>
              <p>✔ Cards</p>
              <p>✔ Wallets</p>
              <p>✔ Netbanking</p>
              <p>✔ Cash On Delivery</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Payment;
