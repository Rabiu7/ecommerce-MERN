import "./OrderDetails.css";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { FiArrowLeft, FiPackage } from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/api/orders/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      const data = await response.json();

      console.log("Order Details:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch order");
      }

      setOrder(data.order);
    } catch (error) {
      console.error("Order Details Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="order-details-page">
        <div className="order-details-container">
          <h2>Loading Order...</h2>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="order-details-page">
        <div className="order-details-container">
          <h2>Order Not Found</h2>

          <button onClick={() => navigate("/orders")}>Back to Orders</button>
        </div>
      </section>
    );
  }

  const address = order.shipping_address || {};

  return (
    <section className="order-details-page">
      <div className="order-details-container">
        {/* HEADER */}

        <button className="back-btn" onClick={() => navigate("/orders")}>
          <FiArrowLeft />
          Back to Orders
        </button>

        <div className="order-details-header">
          <div>
            <span>ORDER DETAILS</span>

            <h1>Order #{order.id}</h1>

            <p>
              Placed on {new Date(order.created_at).toLocaleDateString("en-IN")}
            </p>
          </div>

          <div className="order-status">{order.order_status}</div>
        </div>

        {/* PAYMENT */}

        <div className="order-details-box">
          <h2>Payment Information</h2>

          <div className="details-row">
            <span>Payment Method</span>

            <strong>{order.payment_method}</strong>
          </div>

          <div className="details-row">
            <span>Payment Status</span>

            <strong>{order.payment_status}</strong>
          </div>

          <div className="details-row">
            <span>Order Status</span>

            <strong>{order.order_status}</strong>
          </div>

          <div className="details-row">
            <span>Total</span>

            <strong>₹{Number(order.total_amount || 0).toFixed(2)}</strong>
          </div>
        </div>

        {/* PRODUCTS */}

        <div className="order-details-box">
          <h2>
            <FiPackage />
            Ordered Items
          </h2>

          {(order.items || []).map((item) => (
            <div className="detail-product" key={item.id}>
              <div className="detail-product-image">
                {item.image ? (
                  <img src={item.image} alt={item.name || "Product"} />
                ) : (
                  <div>No Image</div>
                )}
              </div>

              <div className="detail-product-info">
                <h3>{item.name || "Product"}</h3>

                <p>Quantity: {item.quantity}</p>

                <p>Price: ₹{Number(item.price || 0).toFixed(2)}</p>
              </div>

              <strong>
                ₹
                {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(
                  2,
                )}
              </strong>
            </div>
          ))}
        </div>

        {/* SHIPPING ADDRESS */}

        <div className="order-details-box">
          <h2>Delivery Address</h2>

          <p>
            <strong>{address.fullName || address.name || "Customer"}</strong>
          </p>

          <p>{address.address || ""}</p>

          <p>
            {address.city || ""}
            {address.city && address.state ? ", " : ""}
            {address.state || ""}
          </p>

          <p>PIN: {address.pincode || ""}</p>

          <p>Phone: {address.phone || ""}</p>
        </div>
      </div>
    </section>
  );
}

export default OrderDetails;
