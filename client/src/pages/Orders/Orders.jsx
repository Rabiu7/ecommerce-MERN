import "./Orders.css";

import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FiPackage,
  FiSearch,
  FiChevronRight,
  FiChevronLeft,
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

  // =========================================================
  // STATE
  // =========================================================

  // Only the current page's orders are stored here.
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("all");

  const [search, setSearch] = useState("");

  // Backend pagination information.
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalOrders: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Backend status counts.
  const [orderStats, setOrderStats] = useState({
    all: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    failed: 0,
    cancelled: 0,
    confirmed: 0,
  });

  // Used for search debounce.
  const searchTimerRef = useRef(null);

  // =========================================================
  // FETCH ORDERS
  // =========================================================

  const fetchOrders = async (
    page = pagination.currentPage,
    searchValue = search,
    status = activeFilter,
  ) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search: searchValue.trim(),
        status,
      });

      const response = await fetch(
        `${VITE_API_URL}/api/orders?${params.toString()}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        },
      );

      const data = await response.json();

      console.log("Fetched Orders:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      // -------------------------------------------------------
      // ORDERS
      // -------------------------------------------------------

      setOrders(Array.isArray(data.orders) ? data.orders : []);

      // -------------------------------------------------------
      // PAGINATION
      // -------------------------------------------------------

      if (data.pagination) {
        setPagination(data.pagination);
      }

      // -------------------------------------------------------
      // STATUS COUNTS
      // -------------------------------------------------------

      if (data.statusCounts) {
        setOrderStats({
          all: Number(data.statusCounts.all) || 0,
          pending: Number(data.statusCounts.pending) || 0,
          processing: Number(data.statusCounts.processing) || 0,
          shipped: Number(data.statusCounts.shipped) || 0,
          delivered: Number(data.statusCounts.delivered) || 0,
          failed: Number(data.statusCounts.failed) || 0,
          cancelled: Number(data.statusCounts.cancelled) || 0,
          confirmed: Number(data.statusCounts.confirmed) || 0,
        });
      }
    } catch (error) {
      console.error("Orders Error:", error);

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    fetchOrders(1, "", "all");

    // Only run when user becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // =========================================================
  // CLEANUP SEARCH TIMER
  // =========================================================

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearch(value);

    // Search always starts from page 1.
    setPagination((previous) => ({
      ...previous,
      currentPage: 1,
    }));

    // Clear previous timer.
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Wait 300ms before calling backend.
    searchTimerRef.current = setTimeout(() => {
      fetchOrders(1, value, activeFilter);
    }, 300);
  };

  // =========================================================
  // STATUS FILTER
  // =========================================================

  const handleFilterChange = (status) => {
    // Clear any pending search request.
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    setActiveFilter(status);

    setPagination((previous) => ({
      ...previous,
      currentPage: 1,
    }));

    fetchOrders(1, search, status);
  };

  // =========================================================
  // CHANGE PAGE
  // =========================================================

  const changePage = (page) => {
    if (page < 1 || page > pagination.totalPages || loading) {
      return;
    }

    fetchOrders(page, search, activeFilter);
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    fetchOrders(pagination.currentPage, search, activeFilter);
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    setSearch("");
    setActiveFilter("all");

    setPagination((previous) => ({
      ...previous,
      currentPage: 1,
    }));

    fetchOrders(1, "", "all");
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
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && orders.length === 0) {
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
        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <div className="orders-page-header">
          <div className="orders-heading">
            <span className="orders-eyebrow">YOUR ACCOUNT</span>

            <h1>Order History</h1>

            <p>
              View, track and manage all your Masha Allah Creations purchases.
            </p>
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

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <div className="orders-stats">
          {/* TOTAL */}

          <div className="order-stat-card">
            <div className="order-stat-icon total">
              <FiPackage />
            </div>

            <div>
              <span>Total Orders</span>

              <strong>{orderStats.all}</strong>
            </div>
          </div>

          {/* PENDING + PROCESSING */}

          <div className="order-stat-card">
            <div className="order-stat-icon pending">
              <FiClock />
            </div>

            <div>
              <span>Pending</span>

              <strong>{orderStats.pending + orderStats.processing}</strong>
            </div>
          </div>

          {/* SHIPPED */}

          <div className="order-stat-card">
            <div className="order-stat-icon shipped">
              <FiTruck />
            </div>

            <div>
              <span>Shipped</span>

              <strong>{orderStats.shipped}</strong>
            </div>
          </div>

          {/* DELIVERED */}

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

        {/* ===================================================
            NO ORDERS
        =================================================== */}

        {orderStats.all === 0 ? (
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
                {/* ALL */}

                <button
                  className={activeFilter === "all" ? "active" : ""}
                  onClick={() => handleFilterChange("all")}
                >
                  All
                  <span>{orderStats.all}</span>
                </button>

                {/* PENDING */}

                <button
                  className={activeFilter === "pending" ? "active" : ""}
                  onClick={() => handleFilterChange("pending")}
                >
                  Pending
                  <span>{orderStats.pending}</span>
                </button>

                {/* PROCESSING */}

                <button
                  className={activeFilter === "processing" ? "active" : ""}
                  onClick={() => handleFilterChange("processing")}
                >
                  Processing
                  <span>{orderStats.processing}</span>
                </button>

                {/* SHIPPED */}

                <button
                  className={activeFilter === "shipped" ? "active" : ""}
                  onClick={() => handleFilterChange("shipped")}
                >
                  Shipped
                  <span>{orderStats.shipped}</span>
                </button>

                {/* DELIVERED */}

                <button
                  className={activeFilter === "delivered" ? "active" : ""}
                  onClick={() => handleFilterChange("delivered")}
                >
                  Delivered
                  <span>{orderStats.delivered}</span>
                </button>
              </div>

              {/* SEARCH */}

              <div className="orders-search">
                <FiSearch />

                <input
                  type="text"
                  placeholder="Search order ID..."
                  value={search}
                  onChange={handleSearchChange}
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
                  {pagination.totalOrders}{" "}
                  {pagination.totalOrders === 1 ? "Order" : "Orders"}
                </h2>
              </div>

              <button
                className="refresh-orders-btn"
                onClick={handleRefresh}
                disabled={loading}
                title="Refresh orders"
              >
                <FiRefreshCw className={loading ? "orders-refresh-spin" : ""} />
              </button>
            </div>

            {/* =================================================
                ORDER LIST
            ================================================= */}

            {loading ? (
              <div className="orders-loading-content">
                <div className="orders-loading-spinner"></div>

                <p>Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="no-filter-results">
                <FiSearch />

                <h3>No matching orders</h3>

                <p>Try another order ID or choose a different filter.</p>

                <button onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
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

                  {orders.map((order) => {
                    const status = getStatusDetails(order.order_status);

                    return (
                      <div className="order-row" key={order.public_order_id}>
                        {/* ORDER */}

                        <div className="order-main">
                          <div className="order-product-icon">
                            <FiPackage />
                          </div>

                          <div>
                            <span className="order-label">ORDER ID</span>

                            <strong>#{order.public_order_id}</strong>
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
                          <button
                            onClick={() =>
                              navigate(
                                `/orders/${encodeURIComponent(
                                  order.public_order_id,
                                )}`,
                              )
                            }
                          >
                            View Order
                            <FiChevronRight />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* =================================================
                    PAGINATION
                ================================================= */}

                {pagination.totalPages > 0 && (
                  <div className="orders-pagination">
                    <span>
                      Showing{" "}
                      <strong>
                        {(pagination.currentPage - 1) * pagination.limit + 1}
                      </strong>{" "}
                      to{" "}
                      <strong>
                        {Math.min(
                          pagination.currentPage * pagination.limit,
                          pagination.totalOrders,
                        )}
                      </strong>{" "}
                      of <strong>{pagination.totalOrders}</strong> orders
                    </span>

                    <div className="pagination-controls">
                      {/* PREVIOUS */}

                      <button
                        type="button"
                        disabled={!pagination.hasPreviousPage || loading}
                        onClick={() => changePage(pagination.currentPage - 1)}
                      >
                        <FiChevronLeft />
                      </button>

                      {/* PAGE */}

                      <span>
                        {pagination.currentPage} / {pagination.totalPages}
                      </span>

                      {/* NEXT */}

                      <button
                        type="button"
                        disabled={!pagination.hasNextPage || loading}
                        onClick={() => changePage(pagination.currentPage + 1)}
                      >
                        <FiChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default Orders;
