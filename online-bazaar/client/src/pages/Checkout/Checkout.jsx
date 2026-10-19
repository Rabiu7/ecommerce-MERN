import "./Checkout.css";
import CheckoutSteps from "../../components/CheckoutSteps/CheckoutSteps";

import { useEffect, useMemo, useState } from "react";
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
  FiPackage,
  FiArrowRight,
  FiCheckCircle,
  FiShoppingBag,
} from "react-icons/fi";

import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getAddress, saveAddress } from "../../services/addressService";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const locationState = location.state;
  const buyNow = locationState?.buyNow === true;

  const buyNowItems = useMemo(
    () => locationState?.cartItems || [],
    [locationState?.cartItems],
  );

  const userId = user?.id;

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

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    const loadCheckoutData = async () => {
      setLoading(true);

      try {
        if (buyNow && buyNowItems.length > 0) {
          setCartItems(buyNowItems);

          try {
            const savedAddress = await getAddress(userId);

            if (!cancelled && savedAddress) {
              setAddress({
                fullName: savedAddress.full_name || "",
                phone: savedAddress.phone || "",
                address: savedAddress.address || "",
                city: savedAddress.city || "",
                state: savedAddress.state || "",
                pincode: savedAddress.pincode || "",
              });
            }
          } catch (error) {
            if (error.response?.status !== 404) {
              console.error("Failed to fetch saved address:", error);
            }
          }

          return;
        }

        const [cartResponse, savedAddress] = await Promise.all([
          fetch(`${VITE_API_URL}/api/cart/${userId}`),
          getAddress(userId).catch((error) => {
            if (error.response?.status !== 404) {
              console.error("Failed to fetch saved address:", error);
            }
            return null;
          }),
        ]);

        const cartData = await cartResponse.json();

        if (!cartResponse.ok) {
          throw new Error(cartData.message || "Failed to load cart.");
        }

        if (!cancelled) {
          setCartItems(Array.isArray(cartData) ? cartData : []);

          if (savedAddress) {
            setAddress({
              fullName: savedAddress.full_name || "",
              phone: savedAddress.phone || "",
              address: savedAddress.address || "",
              city: savedAddress.city || "",
              state: savedAddress.state || "",
              pincode: savedAddress.pincode || "",
            });
          }
        }
      } catch (error) {
        console.error("Checkout data error:", error);

        if (!cancelled) {
          setCartItems([]);
          toast.error(error.message || "Unable to load checkout information.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCheckoutData();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userId, navigate, buyNow, buyNowItems]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const shipping = subtotal >= 999 ? 0 : 99;
  const gst = subtotal * 0.18;
  const total = subtotal + shipping + gst;

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const placeOrder = async (event) => {
    event.preventDefault();

    if (placingOrder) return;

    const requiredFields = [
      address.fullName,
      address.phone,
      address.address,
      address.city,
      address.state,
      address.pincode,
    ];

    if (requiredFields.some((field) => !String(field).trim())) {
      toast.error("Please fill in all delivery address fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(address.phone.trim())) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^[0-9]{6}$/.test(address.pincode.trim())) {
      toast.error("Please enter a valid 6-digit pincode.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setPlacingOrder(true);

    try {
      await saveAddress(userId, address);

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
      toast.error(
        error.response?.data?.message || "Failed to save delivery address.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <section className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-loading">
            <span className="checkout-loader" />
            <h2>Preparing your checkout</h2>
            <p>Getting your order and delivery details ready.</p>
          </div>
        </div>
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-empty">
            <div className="checkout-empty-icon">
              <FiShoppingCart />
            </div>
            <span className="checkout-eyebrow">YOUR BASKET AWAITS</span>
            <h2>Your cart is empty</h2>
            <p>
              Discover something special and add it to your basket before
              continuing to checkout.
            </p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="checkout-primary-btn"
            >
              Explore Products <FiArrowRight />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-topbar">
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
            <span>{buyNow ? "Back to Product" : "Back to Cart"}</span>
          </button>

          <div className="checkout-secure-label">
            <FiShield />
            <span>SECURE CHECKOUT</span>
          </div>
        </header>

        <div className="checkout-hero">
          <div className="checkout-hero-decoration checkout-decoration-one" />
          <div className="checkout-hero-decoration checkout-decoration-two" />

          <span className="checkout-eyebrow">ONLINE BAZAAR</span>
          <h1>
            Almost <em>yours.</em>
          </h1>
          <p>
            Thoughtfully selected. Carefully packed. Delivered to your door.
          </p>

          <div className="checkout-trust-points">
            <span>
              <FiCheckCircle /> Easy checkout
            </span>
            <span>
              <FiShield /> Secure payment
            </span>
            <span>
              <FiTruck /> Reliable delivery
            </span>
          </div>
        </div>

        <div className="checkout-steps-wrap">
          <CheckoutSteps currentStep={1} />
        </div>

        <form className="checkout-grid" onSubmit={placeOrder}>
          <div className="checkout-left">
            <div className="checkout-section-intro">
              <span className="checkout-section-number">01</span>
              <div>
                <h2>Delivery details</h2>
                <p>Tell us where your order should arrive.</p>
              </div>
            </div>

            <section className="checkout-card address-card">
              <div className="checkout-card-heading">
                <div className="checkout-heading-icon">
                  <FiMapPin />
                </div>
                <div>
                  <h3>Shipping address</h3>
                  <p>Fields marked with * are required.</p>
                </div>
              </div>

              <div className="checkout-form">
                <div className="form-group full-width">
                  <label htmlFor="fullName">
                    Full name <span>*</span>
                  </label>
                  <div className="checkout-input-wrap">
                    <FiUser />
                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      placeholder="Name of the recipient"
                      value={address.fullName}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="phone">
                    Phone number <span>*</span>
                  </label>
                  <div className="checkout-input-wrap">
                    <FiPhone />
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="10-digit mobile number"
                      value={address.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="address">
                    Street address <span>*</span>
                  </label>
                  <div className="checkout-input-wrap checkout-textarea-wrap">
                    <FiHome />
                    <textarea
                      id="address"
                      name="address"
                      placeholder="House / flat number, street and area"
                      value={address.address}
                      onChange={handleChange}
                      autoComplete="street-address"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="city">
                    City <span>*</span>
                  </label>
                  <input
                    id="city"
                    className="checkout-plain-input"
                    type="text"
                    name="city"
                    placeholder="Your city"
                    value={address.city}
                    onChange={handleChange}
                    autoComplete="address-level2"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">
                    State <span>*</span>
                  </label>
                  <input
                    id="state"
                    className="checkout-plain-input"
                    type="text"
                    name="state"
                    placeholder="Your state"
                    value={address.state}
                    onChange={handleChange}
                    autoComplete="address-level1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">
                    PIN code <span>*</span>
                  </label>
                  <input
                    id="pincode"
                    className="checkout-plain-input"
                    type="text"
                    name="pincode"
                    placeholder="6-digit PIN"
                    value={address.pincode}
                    onChange={handleChange}
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div className="checkout-address-note">
                <FiShield />
                <span>
                  Your delivery information is used to fulfil this order.
                </span>
              </div>
            </section>

            <div className="checkout-benefits">
              <div className="checkout-benefit">
                <div className="checkout-benefit-icon">
                  <FiPackage />
                </div>
                <div>
                  <strong>Carefully packed</strong>
                  <span>Prepared with care for delivery.</span>
                </div>
              </div>

              <div className="checkout-benefit">
                <div className="checkout-benefit-icon">
                  <FiShield />
                </div>
                <div>
                  <strong>Secure checkout</strong>
                  <span>Your checkout details stay protected.</span>
                </div>
              </div>
            </div>
          </div>

          <aside className="checkout-right">
            <div className="checkout-summary-card">
              <div className="checkout-summary-top">
                <div className="checkout-summary-heading-icon">
                  <FiShoppingBag />
                </div>
                <div>
                  <span className="checkout-summary-eyebrow">
                    THE GOOD STUFF
                  </span>
                  <h2>Your order</h2>
                </div>
                <span className="checkout-item-count">{cartItems.length}</span>
              </div>

              <div className="checkout-summary-products">
                {cartItems.map((item) => (
                  <div
                    className="checkout-summary-product"
                    key={item.id || item.product_id}
                  >
                    <div className="checkout-product-image">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name || "Product"}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <FiShoppingBag />
                      )}
                    </div>

                    <div className="checkout-product-info">
                      <h3>{item.name || "Product"}</h3>
                      <span>Quantity: {item.quantity}</span>
                      <small>{formatPrice(item.price)} each</small>
                    </div>

                    <strong className="checkout-product-total">
                      {formatPrice(
                        Number(item.price || 0) * Number(item.quantity || 0),
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="checkout-shipping-promo">
                <FiTruck />
                <div>
                  <strong>
                    {shipping === 0
                      ? "Shipping is on us!"
                      : "Almost at free shipping"}
                  </strong>
                  <span>
                    {shipping === 0
                      ? "Your order qualifies for free shipping."
                      : `${formatPrice(999 - subtotal)} more for free shipping.`}
                  </span>
                </div>
              </div>

              <div className="checkout-price-breakdown">
                <div className="checkout-price-row">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div className="checkout-price-row">
                  <span>GST (18%)</span>
                  <strong>{formatPrice(gst)}</strong>
                </div>
                <div className="checkout-price-row">
                  <span>Shipping</span>
                  <strong
                    className={shipping === 0 ? "checkout-free-shipping" : ""}
                  >
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </strong>
                </div>
              </div>

              <div className="checkout-grand-total">
                <div>
                  <span>Total payable</span>
                  <small>Including GST and shipping</small>
                </div>
                <strong>{formatPrice(total)}</strong>
              </div>

              <button
                type="submit"
                className="checkout-primary-btn checkout-payment-btn"
                disabled={placingOrder}
              >
                {placingOrder ? (
                  <>
                    <span className="checkout-button-spinner" />
                    Saving details...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <FiArrowRight />
                  </>
                )}
              </button>

              <div className="checkout-secure-footer">
                <FiShield />
                <span>Secure & encrypted checkout</span>
              </div>
            </div>

            <p className="checkout-summary-disclaimer">
              By continuing, you confirm that your delivery details are correct.
            </p>
          </aside>
        </form>

        <footer className="checkout-page-footer">
          <span>ONLINE BAZAAR</span>
          <span>Made for your everyday needs.</span>
        </footer>
      </div>
    </section>
  );
}

export default Checkout;
