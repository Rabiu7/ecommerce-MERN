import "./Cart.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiChevronRight,
  FiMinus,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiShoppingBag,
  FiShoppingCart,
  FiTag,
  FiTrash2,
  FiTruck,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const FREE_SHIPPING_LIMIT = 1000;
const SHIPPING_CHARGE = 99;

function formatPrice(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getImageUrl(image) {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  return `${VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

function Cart() {
  const navigate = useNavigate();
  const { user, isAuthenticated, fetchCartCount } = useAuth();

  const userId = user?.id;

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [failedImages, setFailedImages] = useState([]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setCart([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${VITE_API_URL}/api/cart/${userId}`);

      if (!response.ok) {
        throw new Error("Unable to load your cart.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected cart response from server.");
      }

      setCart(data);
    } catch (err) {
      setError(err.message || "Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [cart],
  );

  const totalItems = useMemo(
    () => cart.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cart],
  );

  const shipping =
    subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_CHARGE;

  const total = subtotal + shipping;
  const amountRemaining = Math.max(0, FREE_SHIPPING_LIMIT - subtotal);
  const shippingProgress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_LIMIT) * 100,
  );

  const updateCartCount = useCallback(async () => {
    if (userId && fetchCartCount) {
      try {
        await fetchCartCount(userId);
      } catch (err) {
        console.error("Unable to update cart count:", err);
      }
    }
  }, [userId, fetchCartCount]);

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1 || updatingId !== null || removingId !== null) {
      return;
    }

    setUpdatingId(item.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${VITE_API_URL}/api/cart/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        let message = "Unable to update quantity.";

        try {
          const data = await response.json();
          message = data.message || data.error || message;
        } catch {
          // Keep the default error message.
        }

        throw new Error(message);
      }

      setCart((previousCart) =>
        previousCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity } : cartItem,
        ),
      );

      await updateCartCount();
    } catch (err) {
      setError(err.message || "Unable to update quantity.");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (id) => {
    if (updatingId !== null || removingId !== null) {
      return;
    }

    setRemovingId(id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${VITE_API_URL}/api/cart/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let message = "Unable to remove this item.";

        try {
          const data = await response.json();
          message = data.message || data.error || message;
        } catch {
          // Some DELETE endpoints return an empty response.
        }

        throw new Error(message);
      }

      setCart((previousCart) => previousCart.filter((item) => item.id !== id));

      setNotice("Item removed from your cart.");
      await updateCartCount();
    } catch (err) {
      setError(err.message || "Unable to remove this item.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleImageError = (id) => {
    setFailedImages((previous) =>
      previous.includes(id) ? previous : [...previous, id],
    );
  };

  const checkout = () => {
    if (!cart.length || updatingId !== null || removingId !== null) {
      return;
    }

    navigate("/checkout");
  };

  if (!isAuthenticated) {
    return (
      <main className="bazaar-cart-page">
        <div className="cart-page-container">
          <div className="cart-breadcrumb">
            <Link to="/">Home</Link>
            <FiChevronRight />
            <span>Shopping Cart</span>
          </div>

          <section className="cart-empty-state">
            <div className="cart-empty-icon">
              <FiShoppingBag />
            </div>
            <span className="cart-eyebrow">YOUR SHOPPING BAG</span>
            <h1>Your next favourite is waiting.</h1>
            <p>
              Sign in to view your shopping bag and continue where you left off.
            </p>
            <Link to="/login" className="cart-primary-button">
              Sign in to continue <FiArrowRight />
            </Link>
            <Link to="/products" className="cart-text-link">
              Explore our collection <FiArrowRight />
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="bazaar-cart-page">
      <div className="cart-page-container">
        <div className="cart-breadcrumb">
          <Link to="/">Home</Link>
          <FiChevronRight />
          <span>Shopping Cart</span>
        </div>

        <header className="cart-page-header">
          <div>
            <span className="cart-eyebrow">YOUR SHOPPING BAG</span>
            <h1>
              Shopping <span>Cart.</span>
            </h1>
            <p>
              Thoughtfully chosen, almost yours.{" "}
              {loading
                ? "Loading your items..."
                : `${totalItems} ${totalItems === 1 ? "item" : "items"} in your bag`}
            </p>
          </div>

          <Link to="/products" className="cart-continue-button">
            <FiArrowLeft />
            Continue shopping
          </Link>
        </header>

        {error && (
          <div className="cart-alert cart-alert-error" role="alert">
            <FiX />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <FiX />
            </button>
          </div>
        )}

        {notice && (
          <div className="cart-alert cart-alert-success" role="status">
            <FiCheck />
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <FiX />
            </button>
          </div>
        )}

        {loading ? (
          <section className="cart-loading-state">
            <div className="cart-spinner" />
            <h2>Preparing your shopping bag</h2>
            <p>Just a moment while we gather your items.</p>
          </section>
        ) : error && cart.length === 0 ? (
          <section className="cart-empty-state">
            <div className="cart-empty-icon">
              <FiRefreshCw />
            </div>
            <h2>We couldn't load your cart.</h2>
            <p>Please check your connection and try again.</p>
            <button
              type="button"
              className="cart-primary-button"
              onClick={fetchCart}
            >
              Try again <FiRefreshCw />
            </button>
          </section>
        ) : cart.length === 0 ? (
          <section className="cart-empty-state">
            <div className="cart-empty-icon">
              <FiShoppingCart />
            </div>
            <span className="cart-eyebrow">
              A LITTLE ROOM FOR SOMETHING LOVELY
            </span>
            <h2>Your cart is waiting for something special.</h2>
            <p>Discover pieces you'll love and bring your favourites home.</p>
            <Link to="/products" className="cart-primary-button">
              Discover products <FiArrowRight />
            </Link>
          </section>
        ) : (
          <>
            <section className="cart-shipping-banner">
              <div className="cart-shipping-icon">
                <FiTruck />
              </div>

              <div className="cart-shipping-content">
                <div className="cart-shipping-heading">
                  {shipping === 0 ? (
                    <strong>You've unlocked free shipping!</strong>
                  ) : (
                    <strong>
                      You're ₹{formatPrice(amountRemaining)} away from free
                      shipping
                    </strong>
                  )}
                  <span>
                    {shipping === 0
                      ? "Your delivery is on us."
                      : "A little more to enjoy delivery on us."}
                  </span>
                </div>

                <div
                  className="cart-shipping-progress"
                  role="progressbar"
                  aria-valuenow={Math.round(shippingProgress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Free shipping progress"
                >
                  <span style={{ width: `${shippingProgress}%` }} />
                </div>
              </div>

              <div className="cart-shipping-target">
                <FiCheck />
                <span>₹1,000</span>
              </div>
            </section>

            <div className="cart-main-grid">
              <section className="cart-items-section">
                <div className="cart-section-heading">
                  <div>
                    <span className="cart-eyebrow">THE GOOD STUFF</span>
                    <h2>
                      Your items <span>({cart.length})</span>
                    </h2>
                  </div>
                  <span className="cart-items-label">
                    {totalItems} total {totalItems === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="cart-items-list">
                  {cart.map((item, index) => {
                    const itemBusy =
                      updatingId === item.id || removingId === item.id;

                    const imageUrl = getImageUrl(item.image);
                    const imageFailed = failedImages.includes(item.id);

                    return (
                      <article
                        className="cart-product-card"
                        key={item.id}
                        style={{ animationDelay: `${index * 60}ms` }}
                      >
                        <div className="cart-product-image">
                          {imageUrl && !imageFailed ? (
                            <img
                              src={imageUrl}
                              alt={item.name || "Product"}
                              loading="lazy"
                              onError={() => handleImageError(item.id)}
                            />
                          ) : (
                            <div className="cart-product-placeholder">
                              <FiShoppingBag />
                            </div>
                          )}
                        </div>

                        <div className="cart-product-info">
                          <span className="cart-product-category">
                            ONLINE BAZAAR
                          </span>
                          <h3>{item.name || "Product"}</h3>
                          {item.description && (
                            <p className="cart-product-description">
                              {item.description}
                            </p>
                          )}

                          <div className="cart-product-price">
                            ₹{formatPrice(item.price)}
                            <span> / piece</span>
                          </div>

                          <div className="cart-product-mobile-actions">
                            <div className="cart-quantity-control">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item,
                                    Number(item.quantity) - 1,
                                  )
                                }
                                disabled={
                                  itemBusy ||
                                  updatingId !== null ||
                                  removingId !== null ||
                                  Number(item.quantity) <= 1
                                }
                                aria-label={`Decrease quantity of ${item.name}`}
                              >
                                <FiMinus />
                              </button>

                              <span aria-live="polite">{item.quantity}</span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item,
                                    Number(item.quantity) + 1,
                                  )
                                }
                                disabled={
                                  itemBusy ||
                                  updatingId !== null ||
                                  removingId !== null
                                }
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                <FiPlus />
                              </button>
                            </div>

                            <button
                              type="button"
                              className="cart-remove-button"
                              onClick={() => removeItem(item.id)}
                              disabled={
                                itemBusy ||
                                updatingId !== null ||
                                removingId !== null
                              }
                            >
                              {removingId === item.id ? (
                                <span className="cart-mini-spinner" />
                              ) : (
                                <FiTrash2 />
                              )}
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="cart-product-right">
                          <strong className="cart-product-total">
                            ₹
                            {formatPrice(
                              Number(item.price || 0) *
                                Number(item.quantity || 0),
                            )}
                          </strong>

                          <div className="cart-quantity-control">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item, Number(item.quantity) - 1)
                              }
                              disabled={
                                itemBusy ||
                                updatingId !== null ||
                                removingId !== null ||
                                Number(item.quantity) <= 1
                              }
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              <FiMinus />
                            </button>

                            <span aria-live="polite">{item.quantity}</span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item, Number(item.quantity) + 1)
                              }
                              disabled={
                                itemBusy ||
                                updatingId !== null ||
                                removingId !== null
                              }
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <FiPlus />
                            </button>
                          </div>

                          <button
                            type="button"
                            className="cart-remove-button"
                            onClick={() => removeItem(item.id)}
                            disabled={
                              itemBusy ||
                              updatingId !== null ||
                              removingId !== null
                            }
                          >
                            {removingId === item.id ? (
                              <span className="cart-mini-spinner" />
                            ) : (
                              <FiTrash2 />
                            )}
                            Remove
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <Link to="/products" className="cart-bottom-continue">
                  <FiArrowLeft />
                  Add more to your bag
                </Link>
              </section>

              <aside className="cart-summary-section">
                <div className="cart-summary-card">
                  <div className="cart-summary-heading">
                    <div>
                      <span className="cart-eyebrow">ALMOST YOURS</span>
                      <h2>Order summary</h2>
                    </div>
                    <div className="cart-summary-icon">
                      <FiShoppingBag />
                    </div>
                  </div>

                  <div className="cart-summary-items">
                    <div>
                      <span>Subtotal ({totalItems} items)</span>
                      <strong>₹{formatPrice(subtotal)}</strong>
                    </div>

                    <div>
                      <span>Shipping</span>
                      {shipping === 0 ? (
                        <strong className="cart-free-shipping">FREE</strong>
                      ) : (
                        <strong>₹{formatPrice(shipping)}</strong>
                      )}
                    </div>

                    {shipping === 0 && (
                      <div className="cart-savings-row">
                        <span>
                          <FiTag /> Shipping savings
                        </span>
                        <strong>₹{formatPrice(SHIPPING_CHARGE)}</strong>
                      </div>
                    )}
                  </div>

                  <div className="cart-summary-total">
                    <div>
                      <span>Total amount</span>
                      <small>Inclusive of listed prices</small>
                    </div>
                    <strong>₹{formatPrice(total)}</strong>
                  </div>

                  <button
                    type="button"
                    className="cart-checkout-button"
                    onClick={checkout}
                    disabled={updatingId !== null || removingId !== null}
                  >
                    <span>Proceed to checkout</span>
                    <FiArrowRight />
                  </button>

                  <div className="cart-summary-assurances">
                    <div>
                      <FiShield />
                      <span>Secure checkout</span>
                    </div>
                    <div>
                      <FiTruck />
                      <span>Reliable delivery</span>
                    </div>
                    <div>
                      <FiCheck />
                      <span>Quality shopping</span>
                    </div>
                  </div>

                  <div className="cart-summary-note">
                    <span className="cart-summary-note-icon">
                      <FiCheck />
                    </span>
                    <p>
                      You're one step closer to bringing your favourites home.
                    </p>
                  </div>
                </div>

                <div className="cart-help-card">
                  <div className="cart-help-icon">
                    <FiShield />
                  </div>
                  <div>
                    <strong>Shop with confidence</strong>
                    <p>Your shopping experience matters to us.</p>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Cart;
