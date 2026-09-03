import "./Orders.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FiPackage, FiCalendar, FiChevronRight } from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

const VITE_API_URL = import.meta.env.VITE_API_URL || 5000;

function Orders() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/api/orders`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      const data = await response.json();

      console.log("Fetched Orders:", data);

      setOrders(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="orders-loading">Loading Orders...</div>;
  }

  return (
    <section className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <span>YOUR ACCOUNT</span>

          <h1>My Orders</h1>

          <p>Track and manage your purchases</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <FiPackage />

            <h2>No Orders Found</h2>

            <p>You haven't placed any orders yet.</p>

            <button onClick={() => navigate("/products")}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-top">
                  <div>
                    <span>Order ID</span>
                    <h3>#{order.id}</h3>
                  </div>

                  <div className="status">{order.status}</div>
                </div>

                <div className="order-info">
                  <div>
                    <FiCalendar />
                    <p>{new Date(order.created_at).toDateString()}</p>
                  </div>

                  <div>
                    <FiPackage />
                    <p>₹{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                </div>

                <button
                  className="details-btn"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  View Details
                  <FiChevronRight />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;
