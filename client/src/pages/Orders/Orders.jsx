import "./Orders.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiPackage,
  FiSearch,
  FiChevronRight,
  FiCheckCircle,
  FiTruck,
  FiClock,
  FiXCircle,
  FiShoppingBag,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  // =========================================================
  // FETCH ORDERS
  // =========================================================

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${VITE_API_URL}/api/orders`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      const data = await response.json();

      console.log("Fetched Orders:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Orders Error:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // STATUS DETAILS
  // =========================================================

  const getStatusDetails = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    switch (normalizedStatus) {
      case "delivered":
        return {
          className: "delivered",
          icon: <FiCheckCircle />,
          label: "Delivered",
        };

      case "shipped":
        return {
          className: "shipped",
          icon: <FiTruck />,
          label: "Shipped",
        };

      case "confirmed":
        return {
          className: "confirmed",
          icon: <FiCheckCircle />,
          label: "Confirmed",
        };

      case "processing":
        return {
          className: "processing",
          icon: <FiPackage />,
          label: "Processing",
        };

      case "pending":
        return {
          className: "pending",
          icon: <FiClock />,
          label: "Pending",
        };

      case "cancelled":
        return {
          className: "cancelled",
          icon: <FiXCircle />,
          label: "Cancelled",
        };

      case "failed":
        return {
          className: "failed",
          icon: <FiXCircle />,
          label: "Failed",
        };

      default:
        return {
          className: "pending",
          icon: <FiClock />,
          label: status || "Pending",
        };
    }
  };

  // =========================================================
  // ORDER COUNTS
  // =========================================================

  const orderStats = useMemo(() => {
    const stats = {
      all: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      failed: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      const status = String(order.order_status || "").toLowerCase();

      if (stats[status] !== undefined) {
        stats[status]++;
      }
    });

    return stats;
  }, [orders]);

  // =========================================================
  // FILTER + SEARCH
  // =========================================================

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = String(order.order_status || "").toLowerCase();

      const matchesFilter = activeFilter === "all" || status === activeFilter;

      const orderId = String(order.id || "").toLowerCase();

      const matchesSearch = orderId.includes(search.trim().toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, search]);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <section className="orders-loading-page">
        <div className="orders-loading-content">
          <div className="orders-loading-icon">
            <FiShoppingBag />
          </div>

          <div className="orders-loading-spinner"></div>

          <h2>Loading Your Orders</h2>

          <p>Preparing your order history...</p>

          <div className="orders-loading-line">
            <span></span>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <section className="orders-page">
      <div className="orders-container">
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="orders-page-header">
          <div className="orders-heading">
            <span className="orders-eyebrow">YOUR ACCOUNT</span>

            <h1>Order History</h1>

            <p>View, track and manage all your HomeNeeds purchases.</p>
          </div>

          <button
            className="continue-shopping-btn"
            onClick={() => navigate("/products")}
          >
            <FiShoppingBag />
            Continue Shopping
            <FiArrowRight />
          </button>
        </div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="orders-stats">
          <div className="order-stat-card">
            <div className="order-stat-icon total">
              <FiPackage />
            </div>

            <div>
              <span>Total Orders</span>
              <strong>{orderStats.all}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="order-stat-icon pending">
              <FiClock />
            </div>

            <div>
              <span>Pending</span>
              <strong>{orderStats.pending + orderStats.processing}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="order-stat-icon shipped">
              <FiTruck />
            </div>

            <div>
              <span>Shipped</span>
              <strong>{orderStats.shipped}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="order-stat-icon delivered">
              <FiCheckCircle />
            </div>

            <div>
              <span>Delivered</span>
              <strong>{orderStats.delivered}</strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            NO ORDERS
        ===================================================== */}

        {orders.length === 0 ? (
          <div className="orders-empty-state">
            <div className="empty-icon">
              <FiShoppingBag />
            </div>

            <span className="empty-label">YOUR ORDER HISTORY</span>

            <h2>No orders yet</h2>

            <p>
              You haven't placed any orders yet. Start shopping and your
              purchases will appear here.
            </p>

            <button
              className="empty-shopping-btn"
              onClick={() => navigate("/products")}
            >
              Start Shopping
              <FiArrowRight />
            </button>
          </div>
        ) : (
          <>
            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="orders-toolbar">
              <div className="order-filters">
                <button
                  className={activeFilter === "all" ? "active" : ""}
                  onClick={() => setActiveFilter("all")}
                >
                  All
                  <span>{orderStats.all}</span>
                </button>

                <button
                  className={activeFilter === "pending" ? "active" : ""}
                  onClick={() => setActiveFilter("pending")}
                >
                  Pending
                  <span>{orderStats.pending}</span>
                </button>

                <button
                  className={activeFilter === "processing" ? "active" : ""}
                  onClick={() => setActiveFilter("processing")}
                >
                  Processing
                  <span>{orderStats.processing}</span>
                </button>

                <button
                  className={activeFilter === "shipped" ? "active" : ""}
                  onClick={() => setActiveFilter("shipped")}
                >
                  Shipped
                  <span>{orderStats.shipped}</span>
                </button>

                <button
                  className={activeFilter === "delivered" ? "active" : ""}
                  onClick={() => setActiveFilter("delivered")}
                >
                  Delivered
                  <span>{orderStats.delivered}</span>
                </button>
              </div>

              <div className="orders-search">
                <FiSearch />

                <input
                  type="text"
                  placeholder="Search order ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* =================================================
                RESULTS HEADER
            ================================================= */}

            <div className="orders-results-header">
              <div>
                <span>ORDERS</span>

                <h2>
                  {filteredOrders.length}{" "}
                  {filteredOrders.length === 1 ? "Order" : "Orders"}
                </h2>
              </div>

              <button
                className="refresh-orders-btn"
                onClick={fetchOrders}
                title="Refresh orders"
              >
                <FiRefreshCw />
              </button>
            </div>

            {/* =================================================
                ORDER LIST
            ================================================= */}

            {filteredOrders.length === 0 ? (
              <div className="no-filter-results">
                <FiSearch />

                <h3>No matching orders</h3>

                <p>Try another order ID or choose a different filter.</p>

                <button
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("all");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="orders-table">
                {/* TABLE HEADER */}

                <div className="orders-table-header">
                  <span>ORDER</span>
                  <span>DATE</span>
                  <span>AMOUNT</span>
                  <span>STATUS</span>
                  <span></span>
                </div>

                {/* ORDER ROWS */}

                {filteredOrders.map((order) => {
                  const status = getStatusDetails(order.order_status);

                  return (
                    <div className="order-row" key={order.id}>
                      {/* ORDER */}

                      <div className="order-main">
                        <div className="order-product-icon">
                          <FiPackage />
                        </div>

                        <div>
                          <span className="order-label">ORDER ID</span>

                          <strong>#{order.id}</strong>
                        </div>
                      </div>

                      {/* DATE */}

                      <div className="order-date">
                        <span className="mobile-label">DATE</span>

                        <p>{formatDate(order.created_at)}</p>
                      </div>

                      {/* AMOUNT */}

                      <div className="order-amount">
                        <span className="mobile-label">TOTAL</span>

                        <strong>
                          ₹{Number(order.total_amount || 0).toFixed(2)}
                        </strong>
                      </div>

                      {/* STATUS */}

                      <div className="order-status-cell">
                        <span className="mobile-label">STATUS</span>

                        <div
                          className={`order-status-badge ${status.className}`}
                        >
                          {status.icon}
                          <span>{status.label}</span>
                        </div>
                      </div>

                      {/* ACTION */}

                      <div className="order-action">
                        <button onClick={() => navigate(`/orders/${order.id}`)}>
                          View Order
                          <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default Orders;
