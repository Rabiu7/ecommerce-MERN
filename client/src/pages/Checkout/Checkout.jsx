import "./Checkout.css";
import CheckoutSteps from "../../components/CheckoutSteps/CheckoutSteps";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FiMapPin,
  FiPhone,
  FiShoppingCart,
  FiUser,
  FiHome,
  FiArrowLeft,
  FiShield,
  FiTruck,
} from "react-icons/fi";

import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";

import { getAddress, saveAddress } from "../../services/addressService";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated } = useAuth();

  const buyNow = location.state?.buyNow === true;
  const buyNowItems = location.state?.cartItems || [];

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // =========================================================
  // LOAD CHECKOUT DATA
  // =========================================================

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      navigate("/login");
      return;
    }

    fetchCheckoutData();
  }, [isAuthenticated, user?.id, buyNow]);

  const fetchCheckoutData = async () => {
    setLoading(true);

    if (buyNow && buyNowItems.length > 0) {
      setCartItems(buyNowItems);
      await fetchSavedAddress();
    } else {
      await Promise.all([fetchCart(), fetchSavedAddress()]);
    }

    setLoading(false);
  };

  // =========================================================
  // FETCH CART
  // =========================================================

  const fetchCart = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/api/cart/${user.id}`);

      const data = await response.json();

      if (response.ok) {
        setCartItems(Array.isArray(data) ? data : []);
      } else {
        setCartItems([]);
        toast.error(data.message || "Failed to load cart.");
      }
    } catch (error) {
      console.error("Fetch cart error:", error);

      toast.error("Unable to load your cart.");
    }
  };

  // =========================================================
  // FETCH SAVED ADDRESS
  // =========================================================

  const fetchSavedAddress = async () => {
    try {
      const data = await getAddress(user.id);

      setAddress({
        fullName: data.full_name || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
      });
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Failed to fetch saved address:", error);
      }
    }
  };

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const shipping = subtotal >= 999 ? 0 : 99;

  const gst = subtotal * 0.18;

  const total = subtotal + shipping + gst;

  // =========================================================
  // PLACE ORDER
  // =========================================================

  const placeOrder = async () => {
    if (placingOrder) return;

    const requiredFields = [
      address.fullName,
      address.phone,
      address.address,
      address.city,
      address.state,
      address.pincode,
    ];

    if (requiredFields.some((field) => !field.trim())) {
      toast.error("Please fill all address fields.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setPlacingOrder(true);

    try {
      await saveAddress(user.id, address);

      navigate("/payment", {
        state: {
          amount: total,
          subtotal,
          gst,
          shipping,
          address,
          cartItems,
          buyNow,
        },
      });
    } catch (error) {
      console.error("Save address error:", error);

      toast.error(error.response?.data?.message || "Failed to save address.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <section className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-loading">
            <div className="checkout-loader"></div>
            <p>Preparing your checkout...</p>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (cartItems.length === 0) {
    return (
      <section className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-empty">
            <FiShoppingCart className="empty-cart-icon" />

            <h2>Your cart is empty</h2>

            <p>Add some products before proceeding to checkout.</p>

            <button
              onClick={() => navigate("/products")}
              className="back-shopping-btn"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="checkout-page">
      <div className="checkout-container">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="checkout-header">
          <button
            type="button"
            className="checkout-back"
            onClick={() =>
              navigate(
                buyNow ? `/products/${buyNowItems[0]?.product_id}` : "/cart",
              )
            }
          >
            <FiArrowLeft />
            <span>Back to Cart</span>
          </button>

          <div className="checkout-heading">
            <span className="checkout-eyebrow">SECURE CHECKOUT</span>

            <h1>Complete Your Order</h1>

            <p>Review your details and complete your purchase securely.</p>
          </div>
        </div>

        {/* =====================================================
            CHECKOUT STEPS
        ===================================================== */}

        <CheckoutSteps currentStep={1} />

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="checkout-grid">
          {/* ===================================================
              LEFT SIDE
          =================================================== */}

          <div className="checkout-left">
            {/* ADDRESS CARD */}

            <div className="checkout-card address-card">
              <div className="card-heading">
                <div className="heading-icon">
                  <FiMapPin />
                </div>

                <div>
                  <h2>Delivery Address</h2>

                  <p>Where should we deliver your order?</p>
                </div>
              </div>

              {/* FORM */}

              <div className="checkout-form">
                {/* FULL NAME */}

                <div className="form-group full-width">
                  <label htmlFor="fullName">Full Name</label>

                  <div className="form-input">
                    <FiUser />

                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={address.fullName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* PHONE */}

                <div className="form-group full-width">
                  <label htmlFor="phone">Phone Number</label>

                  <div className="form-input">
                    <FiPhone />

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={address.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* ADDRESS */}

                <div className="form-group full-width">
                  <label htmlFor="address">Street Address</label>

                  <div className="form-input textarea-wrapper">
                    <FiHome />

                    <textarea
                      id="address"
                      name="address"
                      placeholder="House / Flat number, Street, Area"
                      value={address.address}
                      onChange={handleChange}
                      rows="4"
                    />
                  </div>
                </div>

                {/* CITY */}

                <div className="form-group">
                  <label htmlFor="city">City</label>

                  <input
                    id="city"
                    className="plain-input"
                    type="text"
                    name="city"
                    placeholder="City"
                    value={address.city}
                    onChange={handleChange}
                  />
                </div>

                {/* STATE */}

                <div className="form-group">
                  <label htmlFor="state">State</label>

                  <input
                    id="state"
                    className="plain-input"
                    type="text"
                    name="state"
                    placeholder="State"
                    value={address.state}
                    onChange={handleChange}
                  />
                </div>

                {/* PINCODE */}

                <div className="form-group">
                  <label htmlFor="pincode">Pincode</label>

                  <input
                    id="pincode"
                    className="plain-input"
                    type="text"
                    name="pincode"
                    placeholder="6-digit pincode"
                    value={address.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* DELIVERY INFO */}

            <div className="checkout-benefits">
              <div className="benefit-item">
                <FiTruck />

                <div>
                  <strong>Reliable Delivery</strong>
                  <span>
                    Your order will be carefully packed and delivered.
                  </span>
                </div>
              </div>

              <div className="benefit-item">
                <FiShield />

                <div>
                  <strong>Secure Checkout</strong>
                  <span>Your payment and personal details are protected.</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================
              RIGHT SIDE
          =================================================== */}

          <aside className="checkout-right">
            <div className="order-summary">
              {/* SUMMARY HEADER */}

              <div className="summary-header">
                <div>
                  <span>YOUR ORDER</span>

                  <h2>Order Summary</h2>
                </div>

                <div className="item-count">
                  {cartItems.length}
                  {cartItems.length === 1 ? " Item" : " Items"}
                </div>
              </div>

              {/* PRODUCTS */}

              <div className="summary-products">
                {cartItems.map((item) => (
                  <div
                    className="summary-product"
                    key={item.id || item.product_id}
                  >
                    <div className="summary-product-image">
                      <img src={item.image} alt={item.name} />
                    </div>

                    <div className="summary-product-info">
                      <h3>{item.name}</h3>

                      <span>Qty: {item.quantity}</span>
                    </div>

                    <div className="summary-product-price">
                      ₹
                      {(
                        Number(item.price || 0) * Number(item.quantity || 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* PRICE BREAKDOWN */}

              <div className="price-breakdown">
                <div className="summary-price-row">
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toFixed(2)}</strong>
                </div>

                <div className="summary-price-row">
                  <span>GST (18%)</span>
                  <strong>₹{gst.toFixed(2)}</strong>
                </div>

                <div className="summary-price-row">
                  <span>Shipping</span>

                  <strong className={shipping === 0 ? "free-shipping" : ""}>
                    {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                  </strong>
                </div>
              </div>

              {/* TOTAL */}

              <div className="summary-total">
                <div>
                  <span>Total Amount</span>
                  <small>Inclusive of GST</small>
                </div>

                <strong>₹{total.toFixed(2)}</strong>
              </div>

              {/* PLACE ORDER */}

              <button
                type="button"
                className="place-order-btn"
                onClick={placeOrder}
                disabled={placingOrder}
              >
                {placingOrder ? "Saving Address..." : "Continue to Payment"}
              </button>

              <p className="secure-note">
                <FiShield />
                Secure & encrypted checkout
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
