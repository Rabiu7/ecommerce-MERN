import "./Cart.css";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FiTrash2,
  FiShoppingBag,
  FiArrowLeft,
  FiMinus,
  FiPlus,
  FiShield,
  FiTruck,
  FiRefreshCw,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Cart() {
  const { user, isAuthenticated, fetchCartCount } = useAuth();

  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchCart();
      fetchCartCount(user.id);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // =====================================================
  // FETCH CART
  // =====================================================

  const fetchCart = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/api/cart/${user.id}`);

      const data = await response.json();

      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch cart error:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UPDATE QUANTITY
  // =====================================================

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1 || updatingId === item.id) {
      return;
    }

    try {
      setUpdatingId(item.id);

      await fetch(`${VITE_API_URL}/api/cart/${item.id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          quantity,
        }),
      });

      await fetchCart();
      fetchCartCount(user.id);
    } catch (error) {
      console.error("Update quantity error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const removeItem = async (id) => {
    try {
      setUpdatingId(id);

      await fetch(`${VITE_API_URL}/api/cart/${id}`, {
        method: "DELETE",
      });

      await fetchCart();
      fetchCartCount(user.id);
    } catch (error) {
      console.error("Remove cart item error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const FREE_SHIPPING_LIMIT = 1000;

  const shipping = subtotal >= FREE_SHIPPING_LIMIT || subtotal === 0 ? 0 : 99;

  const total = subtotal + shipping;

  const remainingForFreeShipping = FREE_SHIPPING_LIMIT - subtotal;

  const shippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_LIMIT) * 100,
    100,
  );

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!isAuthenticated) {
    return (
      <section className="cart-page">
        <div className="cart-container">
          <div className="cart-empty-state">
            <div className="cart-empty-icon">
              <FiShoppingBag />
            </div>

            <span className="cart-eyebrow">SHOPPING BAG</span>

            <h1>Please Login</h1>

            <p>Login to access your shopping bag and continue shopping.</p>

            <Link to="/login" className="cart-primary-btn">
              Login to Continue
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="cart-page">
        <div className="cart-container">
          <div className="cart-loading">
            <div className="cart-loading-spinner"></div>
            <p>Loading your shopping bag...</p>
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (cartItems.length === 0) {
    return (
      <section className="cart-page">
        <div className="cart-container">
          <div className="cart-page-header">
            <div>
              <span className="cart-eyebrow">YOUR SHOPPING BAG</span>

              <h1>Shopping Bag</h1>
            </div>

            <Link to="/products" className="cart-continue-btn">
              <FiArrowLeft />
              Continue Shopping
            </Link>
          </div>

          <div className="cart-empty-state">
            <div className="cart-empty-icon">
              <FiShoppingBag />
            </div>

            <h2>Your Shopping Bag is Empty</h2>

            <p>Discover something beautiful for your home.</p>

            <Link to="/products" className="cart-primary-btn">
              Start Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // MAIN CART
  // =====================================================

  return (
    <section className="cart-page">
      <div className="cart-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="cart-page-header">
          <div>
            <span className="cart-eyebrow">YOUR SHOPPING BAG</span>

            <h1>Shopping Bag</h1>

            <p>
              {totalItems} {totalItems === 1 ? "item" : "items"} ready for
              checkout
            </p>
          </div>

          <Link to="/products" className="cart-continue-btn">
            <FiArrowLeft />
            Continue Shopping
          </Link>
        </div>

        {/* =================================================
            FREE SHIPPING MESSAGE
        ================================================= */}

        <div className="shipping-progress-card">
          <div className="shipping-progress-top">
            <div className="shipping-progress-title">
              <FiTruck />

              <span>
                {remainingForFreeShipping > 0
                  ? `Add ₹${remainingForFreeShipping.toFixed(
                      2,
                    )} more for FREE shipping`
                  : "You've unlocked FREE shipping"}
              </span>
            </div>

            <strong>₹{FREE_SHIPPING_LIMIT}</strong>
          </div>

          <div className="shipping-progress-track">
            <div
              className="shipping-progress-fill"
              style={{
                width: `${shippingProgress}%`,
              }}
            ></div>
          </div>
        </div>

        {/* =================================================
            CART LAYOUT
        ================================================= */}

        <div className="cart-layout">
          {/* =================================================
              PRODUCTS
          ================================================= */}

          <div className="cart-products-section">
            <div className="cart-section-heading">
              <div>
                <h2>Your Items</h2>

                <span>
                  {cartItems.length}{" "}
                  {cartItems.length === 1 ? "product" : "products"}
                </span>
              </div>
            </div>

            <div className="cart-products">
              {cartItems.map((item) => {
                const itemTotal =
                  Number(item.price || 0) * Number(item.quantity || 0);

                const isUpdating = updatingId === item.id;

                return (
                  <article className="cart-product" key={item.id}>
                    {/* IMAGE */}

                    <Link
                      to={`/products/${item.product_id || item.id}`}
                      className="cart-product-image"
                    >
                      <img src={item.image} alt={item.name} />
                    </Link>

                    {/* DETAILS */}

                    <div className="cart-product-details">
                      <span className="cart-stock">
                        <span></span>
                        In Stock
                      </span>

                      <Link
                        to={`/products/${item.product_id || item.id}`}
                        className="cart-product-name"
                      >
                        {item.name}
                      </Link>

                      {item.description && (
                        <p className="cart-product-description">
                          {item.description}
                        </p>
                      )}

                      <div className="cart-product-bottom">
                        <div className="cart-product-price">
                          ₹{Number(item.price || 0).toFixed(2)}
                        </div>

                        {/* QUANTITY */}

                        <div className="cart-quantity">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item, Number(item.quantity) - 1)
                            }
                            disabled={isUpdating || Number(item.quantity) <= 1}
                            aria-label="Decrease quantity"
                          >
                            <FiMinus />
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item, Number(item.quantity) + 1)
                            }
                            disabled={isUpdating}
                            aria-label="Increase quantity"
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE */}

                    <div className="cart-product-right">
                      <strong>₹{itemTotal.toFixed(2)}</strong>

                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => removeItem(item.id)}
                        disabled={isUpdating}
                        aria-label={`Remove ${item.name}`}
                      >
                        {isUpdating ? (
                          <FiRefreshCw className="spin" />
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* =================================================
                TRUST FEATURES
            ================================================= */}

            <div className="cart-trust-grid">
              <div className="cart-trust-item">
                <FiShield />

                <div>
                  <strong>Secure Checkout</strong>
                  <span>Safe & protected payments</span>
                </div>
              </div>

              <div className="cart-trust-item">
                <FiTruck />

                <div>
                  <strong>Fast Delivery</strong>
                  <span>Reliable doorstep delivery</span>
                </div>
              </div>

              <div className="cart-trust-item">
                <FiRefreshCw />

                <div>
                  <strong>Easy Returns</strong>
                  <span>Simple return process</span>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <aside className="cart-summary">
            <div className="cart-summary-header">
              <div>
                <span className="cart-eyebrow">CHECKOUT</span>

                <h2>Order Summary</h2>
              </div>

              <span className="cart-summary-count">{totalItems}</span>
            </div>

            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Subtotal</span>

                <strong>₹{subtotal.toFixed(2)}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Shipping</span>

                <strong className={shipping === 0 ? "free-shipping" : ""}>
                  {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                </strong>
              </div>
            </div>

            <div className="cart-summary-divider"></div>

            <div className="cart-total">
              <div>
                <span>Total</span>

                <small>Taxes calculated at checkout</small>
              </div>

              <strong>₹{total.toFixed(2)}</strong>
            </div>

            <button
              type="button"
              className="cart-checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>

            <Link to="/products" className="cart-summary-shopping">
              <FiArrowLeft />
              Continue Shopping
            </Link>

            <div className="cart-summary-security">
              <div className="summary-security-icon">
                <FiShield />
              </div>

              <div>
                <strong>Secure Shopping</strong>

                <p>Your information is protected with secure encryption.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Cart;
