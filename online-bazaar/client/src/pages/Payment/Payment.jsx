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
  FiLock,
  FiPackage,
  FiArrowRight,
  FiShoppingBag,
} from "react-icons/fi";

import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

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

  useEffect(() => {
    if (window.Cashfree) {
      setCashfreeReady(true);
      return;
    }

    const existingScript = document.querySelector("#cashfree-sdk");

    if (existingScript) {
      const handleLoad = () => setCashfreeReady(true);
      const handleError = () =>
        toast.error("Unable to load Cashfree payment gateway.");

      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);

      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");

    script.id = "cashfree-sdk";
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;

    script.onload = () => setCashfreeReady(true);

    script.onerror = () => {
      toast.error("Unable to load Cashfree payment gateway.");
    };

    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getCheckoutPayload = (method) => ({
    payment_method: method,
    shipping_address: address,
    buy_now: buyNow,
    buy_now_product_id: buyNow ? cartItems[0]?.product_id : null,
    buy_now_quantity: buyNow ? Number(cartItems[0]?.quantity || 1) : null,
    customer: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || address?.phone || "",
    },
  });

  const createOrder = async (method) => {
    const response = await fetch(`${VITE_API_URL}/api/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(getCheckoutPayload(method)),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to place order");
    }

    return data;
  };

  const handleCOD = async () => {
    try {
      setProcessing(true);

      const data = await createOrder("COD");

      toast.success("Order placed successfully!");

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

  const handleOnlinePayment = async () => {
    try {
      setProcessing(true);

      if (!cashfreeReady || !window.Cashfree) {
        toast.error("Cashfree is still loading. Please try again in a moment.");
        setProcessing(false);
        return;
      }

      const orderData = await createOrder("ONLINE");

      if (!orderData.paymentSessionId) {
        throw new Error("Cashfree payment session was not created");
      }

      if (orderData.cashfreeOrderId) {
        localStorage.setItem("cashfreeOrderId", orderData.cashfreeOrderId);
      }

      const cashfreeMode = import.meta.env.VITE_CASHFREE_MODE || "sandbox";

      const cashfree = window.Cashfree({
        mode: cashfreeMode,
      });

      const result = await cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: "_self",
        mode: cashfreeMode,
      });

      if (result?.error) {
        toast.error(result.error.message || "Unable to open Cashfree checkout");
        setProcessing(false);
        return;
      }

      if (result?.warning) {
        console.warn("Cashfree Checkout Warning:", result.warning);
      }
    } catch (error) {
      console.error("Cashfree Payment Error:", error);
      toast.error(error.message || "Unable to start payment");
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (processing) return;

    if (paymentMethod === "COD") {
      await handleCOD();
      return;
    }

    await handleOnlinePayment();
  };

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

  if (!location.state) {
    return (
      <section className="payment-page">
        <div className="payment-container">
          <div className="payment-empty-state">
            <div className="payment-empty-icon">
              <FiShoppingBag />
            </div>

            <span className="payment-eyebrow">ONLINE BAZAAR</span>

            <h1>Your checkout is waiting</h1>

            <p>
              Please return to checkout and confirm your delivery details before
              proceeding to payment.
            </p>

            <button
              type="button"
              className="payment-primary-btn"
              onClick={() => navigate("/checkout")}
            >
              Return to Checkout
              <FiArrowRight />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="payment-page">
      <div className="payment-container">
        <div className="payment-topbar">
          <button
            type="button"
            className="payment-back-btn"
            onClick={goBackToCheckout}
            disabled={processing}
          >
            <FiArrowLeft />
            <span>Back to Checkout</span>
          </button>

          <div className="payment-topbar-trust">
            <FiLock />
            <span>Secure Checkout</span>
          </div>
        </div>

        <header className="payment-header">
          <div className="payment-header-copy">
            <span className="payment-eyebrow">ONLINE BAZAAR · FINAL STEP</span>

            <h1>
              Almost <span>yours.</span>
            </h1>

            <p>
              Review your order, choose how you would like to pay, and complete
              your purchase.
            </p>
          </div>

          <div className="payment-header-decoration">
            <div className="payment-decoration-circle">
              <FiCreditCard />
            </div>
            <span>Simple. Secure. Convenient.</span>
          </div>
        </header>

        <div className="payment-steps-wrap">
          <CheckoutSteps currentStep={2} />
        </div>

        <div className="payment-grid">
          <div className="payment-left">
            <section className="payment-panel delivery-panel">
              <div className="payment-panel-heading">
                <div className="payment-heading-icon">
                  <FiMapPin />
                </div>

                <div className="payment-heading-copy">
                  <span className="card-eyebrow">STEP 01 · DELIVERY</span>
                  <h2>Where should we deliver?</h2>
                  <p>Your order will be shipped to this address.</p>
                </div>

                <span className="payment-section-number">01</span>
              </div>

              <div className="delivery-address-card">
                <div className="delivery-address-top">
                  <div className="delivery-address-icon">
                    <FiTruck />
                  </div>

                  <div className="delivery-address-label">
                    <strong>Delivery address</strong>
                    <span>Shipping destination</span>
                  </div>

                  <span className="address-verified">
                    <FiCheckCircle />
                    Selected
                  </span>
                </div>

                <div className="delivery-address-content">
                  <h3>{address.fullName || user?.name || "Customer"}</h3>

                  {address.address && <p>{address.address}</p>}

                  {(address.city || address.state || address.pincode) && (
                    <p>
                      {[address.city, address.state].filter(Boolean).join(", ")}
                      {address.pincode ? ` - ${address.pincode}` : ""}
                    </p>
                  )}

                  {(address.phone || user?.phone) && (
                    <div className="delivery-phone">
                      <FiSmartphone />
                      <span>{address.phone || user?.phone}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="change-address-btn"
                  onClick={goBackToCheckout}
                  disabled={processing}
                >
                  Change address
                  <FiArrowRight />
                </button>
              </div>
            </section>

            <section className="payment-panel method-panel">
              <div className="payment-panel-heading">
                <div className="payment-heading-icon">
                  <FiCreditCard />
                </div>

                <div className="payment-heading-copy">
                  <span className="card-eyebrow">STEP 02 · PAYMENT</span>
                  <h2>How would you like to pay?</h2>
                  <p>Choose the payment method that works for you.</p>
                </div>

                <span className="payment-section-number">02</span>
              </div>

              <div className="payment-method-list">
                <button
                  type="button"
                  className={`payment-option ${
                    paymentMethod === "ONLINE" ? "active" : ""
                  }`}
                  onClick={() => !processing && setPaymentMethod("ONLINE")}
                  disabled={processing}
                  aria-pressed={paymentMethod === "ONLINE"}
                >
                  <div className="payment-option-icon online-icon">
                    <FiSmartphone />
                  </div>

                  <div className="payment-option-content">
                    <div className="payment-option-title">
                      <h3>Online payment</h3>
                      <span className="recommended-badge">Recommended</span>
                    </div>

                    <p>
                      Pay instantly with UPI, credit/debit cards, wallets or net
                      banking.
                    </p>

                    <div className="payment-tags">
                      <span>UPI</span>
                      <span>Cards</span>
                      <span>Wallets</span>
                      <span>Net banking</span>
                    </div>
                  </div>

                  <div className="payment-radio">
                    {paymentMethod === "ONLINE" && <FiCheckCircle />}
                  </div>
                </button>

                <button
                  type="button"
                  className={`payment-option ${
                    paymentMethod === "COD" ? "active" : ""
                  }`}
                  onClick={() => !processing && setPaymentMethod("COD")}
                  disabled={processing}
                  aria-pressed={paymentMethod === "COD"}
                >
                  <div className="payment-option-icon cod-icon">
                    <FiTruck />
                  </div>

                  <div className="payment-option-content">
                    <div className="payment-option-title">
                      <h3>Cash on delivery</h3>
                    </div>

                    <p>Place your order now and pay when it arrives.</p>

                    <span className="cod-note">Pay upon delivery</span>
                  </div>

                  <div className="payment-radio">
                    {paymentMethod === "COD" && <FiCheckCircle />}
                  </div>
                </button>
              </div>

              <div className="payment-security">
                <div className="security-icon">
                  <FiShield />
                </div>

                <div>
                  <h4>Your security matters</h4>
                  <p>
                    Online payments are processed through Cashfree. Online
                    Bazaar does not store your card details.
                  </p>
                </div>

                <FiLock className="security-lock" />
              </div>
            </section>
          </div>

          <aside className="payment-summary">
            <div className="summary-top-accent" />

            <div className="summary-content">
              <div className="summary-header">
                <div>
                  <span className="card-eyebrow">THE GOOD STUFF</span>
                  <h2>Your order</h2>
                  <p>Everything looks good?</p>
                </div>

                <div className="summary-bag-icon">
                  <FiShoppingBag />
                </div>
              </div>

              <div className="summary-items-heading">
                <span>ITEMS IN YOUR BAG</span>
                <span>
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="payment-products">
                {cartItems.length > 0 ? (
                  cartItems.map((item, index) => (
                    <div
                      className="payment-product"
                      key={
                        item.id || item.product_id || `${item.name}-${index}`
                      }
                    >
                      <div className="payment-product-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name || "Product"} />
                        ) : (
                          <FiPackage />
                        )}

                        <span className="product-quantity">
                          {item.quantity || 1}
                        </span>
                      </div>

                      <div className="payment-product-info">
                        <h4>{item.name || "Product"}</h4>
                        <p>Qty: {item.quantity || 1}</p>
                      </div>

                      <strong>
                        {formatPrice(
                          Number(item.price || 0) * Number(item.quantity || 1),
                        )}
                      </strong>
                    </div>
                  ))
                ) : (
                  <div className="payment-no-items">
                    <FiShoppingBag />
                    <p>No product details available.</p>
                  </div>
                )}
              </div>

              <div className="summary-breakdown">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>

                <div className="summary-row">
                  <span>GST</span>
                  <strong>{formatPrice(gst)}</strong>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <strong className={Number(shipping) === 0 ? "free-text" : ""}>
                    {Number(shipping) === 0 ? "FREE" : formatPrice(shipping)}
                  </strong>
                </div>
              </div>

              <div className="summary-payment-method">
                <div className="summary-method-icon">
                  {paymentMethod === "ONLINE" ? <FiCreditCard /> : <FiTruck />}
                </div>

                <div>
                  <span>PAYMENT METHOD</span>
                  <strong>
                    {paymentMethod === "ONLINE"
                      ? "Online payment"
                      : "Cash on delivery"}
                  </strong>
                </div>

                <span className="summary-method-dot" />
              </div>

              <div className="payment-total">
                <div>
                  <span>Total payable</span>
                  <small>Inclusive of applicable taxes</small>
                </div>

                <strong>{formatPrice(amount)}</strong>
              </div>

              <button
                type="button"
                className="pay-btn"
                onClick={handlePayment}
                disabled={processing}
              >
                <span>
                  {processing
                    ? "Processing your order..."
                    : paymentMethod === "COD"
                      ? "Place COD order"
                      : "Continue to payment"}
                </span>

                {!processing && <FiArrowRight />}
              </button>

              <div className="payment-trust">
                <FiShield />
                <span>
                  {paymentMethod === "COD"
                    ? "Your order is protected"
                    : "Secure and encrypted checkout"}
                </span>
              </div>

              <div className="payment-summary-footer">
                <span>THANK YOU FOR SHOPPING WITH</span>
                <strong>Online Bazaar</strong>
              </div>
            </div>
          </aside>
        </div>

        <footer className="payment-page-footer">
          <span>ONLINE BAZAAR</span>
          <span className="footer-separator">•</span>
          <span>Shopping made simple.</span>
        </footer>
      </div>
    </section>
  );
}

export default Payment;
