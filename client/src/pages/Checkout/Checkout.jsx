import "./Checkout.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";

const VITE_API_URL = import.meta.env.VITE_API_URL || 5000;

function Checkout() {
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/api/cart/${user.id}`);

      const data = await response.json();

      setCartItems(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  const shipping = subtotal >= 999 ? 0 : 99;

  const gst = subtotal * 0.18;

  const total = subtotal + shipping + gst;

  const placeOrder = () => {
    if (
      !address.fullName ||
      !address.phone ||
      !address.address ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      toast.error("Please fill all address fields");
      return;
    }

    navigate("/payment", {
      state: {
        amount: total,
        subtotal,
        gst,
        shipping,
        address,
        cartItems,
      },
    });
  };

  if (loading) {
    return (
      <section className="checkout-page">
        <div className="container">
          <h2>Loading...</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>

          <p>Complete your purchase securely.</p>
        </div>

        <div className="checkout-grid">
          <div className="shipping-card">
            <h2>Shipping Address</h2>

            <div className="input-box">
              <FiUser />

              <input
                name="fullName"
                placeholder="Full Name"
                value={address.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">
              <FiPhone />

              <input
                name="phone"
                placeholder="Phone Number"
                value={address.phone}
                onChange={handleChange}
              />
            </div>

            <div className="input-box">
              <FiMapPin />

              <textarea
                name="address"
                placeholder="Street Address"
                value={address.address}
                onChange={handleChange}
              />
            </div>

            <input
              className="simple-input"
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleChange}
            />

            <input
              className="simple-input"
              name="state"
              placeholder="State"
              value={address.state}
              onChange={handleChange}
            />

            <input
              className="simple-input"
              name="pincode"
              placeholder="Pincode"
              value={address.pincode}
              onChange={handleChange}
            />
          </div>

          <div className="summary-card">
            <h2>Order Summary</h2>

            {cartItems.map((item) => (
              <div className="summary-item" key={item.id}>
                <img src={item.image} alt={item.name} />

                <div>
                  <h4>{item.name}</h4>

                  <p>Qty : {item.quantity}</p>
                </div>

                <h4>₹{(Number(item.price) * item.quantity).toFixed(2)}</h4>
              </div>
            ))}

            <hr />

            <div className="price-row">
              <span>Subtotal</span>

              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="price-row">
              <span>GST (18%)</span>

              <span>₹{gst.toFixed(2)}</span>
            </div>

            <div className="price-row">
              <span>Shipping</span>

              <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
            </div>

            <div className="price-row total">
              <span>Total</span>

              <span>₹{total.toFixed(2)}</span>
            </div>

            <button className="place-order-btn" onClick={placeOrder}>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
