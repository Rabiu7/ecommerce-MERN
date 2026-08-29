import "./Cart.css";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiShoppingBag, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

import { useNavigate } from "react-router-dom";

const VITE_API_URL = import.meta.env.VITE_API_URL || 5000;

function Cart() {
  const { user, isAuthenticated, fetchCartCount } = useAuth();

  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchCartCount(user.id);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/api/cart/${user.id}`);

      const data = await response.json();

      setCartItems(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const increaseQty = async (item) => {
    await fetch(`${VITE_API_URL}/api/cart/${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: item.quantity + 1,
      }),
    });

    fetchCart();
  };

  const decreaseQty = async (item) => {
    if (item.quantity <= 1) return;

    await fetch(`${VITE_API_URL}/api/cart/${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: item.quantity - 1,
      }),
    });

    fetchCart();
  };

  const removeItem = async (id) => {
    await fetch(`${VITE_API_URL}/api/cart/${id}`, {
      method: "DELETE",
    });

    fetchCart();
  };

  if (!isAuthenticated) {
    return (
      <section className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <FiShoppingBag className="empty-icon" />

            <h2>Please Login</h2>

            <p>Login to view your shopping cart.</p>

            <Link to="/login" className="checkout-btn">
              Login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return <div className="orders-loading">Loading Orders...</div>;
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  const shipping = subtotal >= 1000 ? 0 : 99;

  const total = subtotal + shipping;

  return (
    <section className="cart-page">
      <div className="container">
        <div className="cart-header">
          <div>
            <h1>Shopping Cart</h1>

            <p>{cartItems.length} Items in your cart</p>
          </div>

          <Link to="/products" className="continue-btn">
            <FiArrowLeft />
            Continue Shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <FiShoppingBag className="empty-icon" />

            <h2>Your Cart is Empty</h2>

            <p>Add some beautiful products to start shopping.</p>

            <Link to="/products" className="checkout-btn">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-card" key={item.id}>
                  <img src={item.image} alt={item.name} />

                  <div className="cart-info">
                    <span className="stock">In Stock</span>

                    <h2>{item.name}</h2>

                    <p>{item.description}</p>

                    <h3>₹{Number(item.price).toFixed(2)}</h3>

                    <div className="qty-box">
                      <button onClick={() => decreaseQty(item)}>-</button>

                      <span>{item.quantity}</span>

                      <button onClick={() => increaseQty(item)}>+</button>
                    </div>
                  </div>

                  <div className="cart-right">
                    <h2>₹{(Number(item.price) * item.quantity).toFixed(2)}</h2>

                    <button
                      className="delete-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-card">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Items</span>

                <span>{cartItems.length}</span>
              </div>

              <div className="summary-row">
                <span>Subtotal</span>

                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>

                <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
              </div>

              <hr />

              <div className="summary-row total">
                <span>Total</span>

                <span>₹{total.toFixed(2)}</span>
              </div>

              <button
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

              <div className="secure-box">
                <h4>Secure Checkout</h4>

                <p>✔ Cash on Delivery</p>

                <p>✔ Easy Returns</p>

                <p>✔ Fast Delivery</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Cart;
