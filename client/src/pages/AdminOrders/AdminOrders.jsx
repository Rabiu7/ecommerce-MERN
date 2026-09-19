import "./AdminOrders.css";

import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FiSearch,
  FiEye,
  FiRefreshCw,
  FiShoppingBag,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminOrders() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  // Orders returned by the backend.
  // This will contain ONLY the current page's orders.
  const [orders, setOrders] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  // Number of orders requested from backend per page.
  const ordersPerPage = 10;

  // Backend pagination information.
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: ordersPerPage,
    totalOrders: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Backend status summary counts.
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    failed: 0,
  });

  // Used to debounce search requests.
  const searchTimerRef = useRef(null);

  // =========================================================
  // FETCH ORDERS
  // =========================================================

  const fetchOrders = async (
    page = currentPage,
    search = searchTerm,
    status = statusFilter,
  ) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(ordersPerPage),
        search: search.trim(),
        status,
      });

      const response = await fetch(
        `${VITE_API_URL}/api/admin/orders?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      console.log("Admin orders:", data);

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
        setStatusCounts({
          all: Number(data.statusCounts.all) || 0,
          pending: Number(data.statusCounts.pending) || 0,
          confirmed: Number(data.statusCounts.confirmed) || 0,
          processing: Number(data.statusCounts.processing) || 0,
          shipped: Number(data.statusCounts.shipped) || 0,
          delivered: Number(data.statusCounts.delivered) || 0,
          cancelled: Number(data.statusCounts.cancelled) || 0,
          failed: Number(data.statusCounts.failed) || 0,
        });
      }

      setCurrentPage(data.pagination?.currentPage || page);
    } catch (error) {
      console.error("Admin orders error:", error);

      setOrders([]);

      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchOrders(1, "", "all");

    // We only want this request when the page initially loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================
  // CLEAN SEARCH TIMER
  // =========================================================

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // =========================================================
  // SEARCH CHANGE
  // =========================================================

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchTerm(value);

    // Always go back to page 1 for a new search.
    setCurrentPage(1);

    // Clear previous timer.
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Wait 300ms before sending request.
    searchTimerRef.current = setTimeout(() => {
      fetchOrders(1, value, statusFilter);
    }, 300);
  };

  // =========================================================
  // STATUS CHANGE
  // =========================================================

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;

    setStatusFilter(newStatus);

    // Status change should always start from page 1.
    setCurrentPage(1);

    fetchOrders(1, searchTerm, newStatus);
  };

  // =========================================================
  // SUMMARY STATUS CLICK
  // =========================================================

  const handleSummaryStatusChange = (status) => {
    setStatusFilter(status);

    setCurrentPage(1);

    fetchOrders(1, searchTerm, status);
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    fetchOrders(currentPage, searchTerm, statusFilter);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // FORMAT AMOUNT
  // =========================================================

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =========================================================
  // GET INITIALS
  // =========================================================

  const getInitials = (name) => {
    if (!name) {
      return "C";
    }

    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // =========================================================
  // CHANGE PAGE
  // =========================================================

  const changePage = (page) => {
    if (page < 1 || page > pagination.totalPages) {
      return;
    }

    setCurrentPage(page);

    fetchOrders(page, searchTerm, statusFilter);
  };

  // =========================================================
  // VIEW ORDER
  // =========================================================

  const viewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && orders.length === 0) {
    return (
      <div className="admin-orders-page">
        <div className="admin-orders-loading">
          <div className="orders-loading-spinner"></div>

          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="admin-orders-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-orders-header">
        <div>
          <span className="admin-orders-label">ORDER MANAGEMENT</span>

          <h1>Orders</h1>

          <p>View and manage all customer orders.</p>
        </div>

        <button
          type="button"
          className="orders-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? "orders-refresh-spin" : ""} />

          <span>Refresh</span>
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="admin-orders-error">
          <span>{error}</span>

          <button type="button" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="orders-summary">
        {/* ALL */}

        <button
          type="button"
          className={`order-summary-card ${
            statusFilter === "all" ? "active" : ""
          }`}
          onClick={() => handleSummaryStatusChange("all")}
        >
          <span>All Orders</span>

          <strong>{statusCounts.all}</strong>
        </button>

        {/* PENDING */}

        <button
          type="button"
          className={`order-summary-card ${
            statusFilter === "pending" ? "active" : ""
          }`}
          onClick={() => handleSummaryStatusChange("pending")}
        >
          <span>Pending</span>

          <strong>{statusCounts.pending}</strong>
        </button>

        {/* PROCESSING */}

        <button
          type="button"
          className={`order-summary-card ${
            statusFilter === "processing" ? "active" : ""
          }`}
          onClick={() => handleSummaryStatusChange("processing")}
        >
          <span>Processing</span>

          <strong>{statusCounts.processing}</strong>
        </button>

        {/* SHIPPED */}

        <button
          type="button"
          className={`order-summary-card ${
            statusFilter === "shipped" ? "active" : ""
          }`}
          onClick={() => handleSummaryStatusChange("shipped")}
        >
          <span>Shipped</span>

          <strong>{statusCounts.shipped}</strong>
        </button>

        {/* DELIVERED */}

        <button
          type="button"
          className={`order-summary-card ${
            statusFilter === "delivered" ? "active" : ""
          }`}
          onClick={() => handleSummaryStatusChange("delivered")}
        >
          <span>Delivered</span>

          <strong>{statusCounts.delivered}</strong>
        </button>

        {/* CANCELLED */}

        <button
          type="button"
          className={`order-summary-card ${
            statusFilter === "cancelled" ? "active" : ""
          }`}
          onClick={() => handleSummaryStatusChange("cancelled")}
        >
          <span>Cancelled</span>

          <strong>{statusCounts.cancelled}</strong>
        </button>
      </div>

      {/* =====================================================
          ORDERS CARD
      ===================================================== */}

      <div className="admin-orders-card">
        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <div className="orders-toolbar">
          {/* SEARCH */}

          <div className="orders-search">
            <FiSearch />

            <input
              type="text"
              placeholder="Search by order ID, customer, email or phone..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* STATUS */}

          <select
            className="orders-status-filter"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="all">All Statuses</option>

            <option value="pending">Pending</option>

            <option value="confirmed">Confirmed</option>

            <option value="processing">Processing</option>

            <option value="shipped">Shipped</option>

            <option value="delivered">Delivered</option>

            <option value="cancelled">Cancelled</option>

            <option value="failed">Failed</option>
          </select>
        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        {loading ? (
          <div className="orders-table-loading">
            <div className="orders-loading-spinner"></div>

            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <FiShoppingBag />
            </div>

            <h3>No orders found</h3>

            <p>
              {searchTerm || statusFilter !== "all"
                ? "Try changing your search or filter."
                : "There are no orders yet."}
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                TABLE
            ================================================= */}

            <div className="orders-table-wrapper">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>ORDER</th>

                    <th>CUSTOMER</th>

                    <th>AMOUNT</th>

                    <th>PAYMENT</th>

                    <th>STATUS</th>

                    <th>DATE</th>

                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      {/* ORDER */}

                      <td>
                        <div className="admin-order-id">
                          <strong>#{order.id}</strong>

                          {order.cashfree_order_id && (
                            <span>{order.cashfree_order_id}</span>
                          )}
                        </div>
                      </td>

                      {/* CUSTOMER */}

                      <td>
                        <div className="admin-customer-cell">
                          <div className="admin-customer-avatar">
                            {getInitials(order.customer_name)}
                          </div>

                          <div className="admin-customer-info">
                            <strong>
                              {order.customer_name || "Unknown Customer"}
                            </strong>

                            <span>{order.customer_email || "-"}</span>
                          </div>
                        </div>
                      </td>

                      {/* AMOUNT */}

                      <td>
                        <span className="admin-order-amount">
                          ₹{formatAmount(order.total_amount)}
                        </span>
                      </td>

                      {/* PAYMENT */}

                      <td>
                        <div className="admin-payment-cell">
                          <span className="payment-method">
                            {order.payment_method || "-"}
                          </span>

                          <span
                            className={`payment-status ${String(
                              order.payment_status || "pending",
                            ).toLowerCase()}`}
                          >
                            {order.payment_status || "pending"}
                          </span>
                        </div>
                      </td>

                      {/* ORDER STATUS */}

                      <td>
                        <span
                          className={`admin-order-status ${String(
                            order.order_status || "pending",
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          <span className="status-dot"></span>

                          {order.order_status || "pending"}
                        </span>
                      </td>

                      {/* DATE */}

                      <td>
                        <span className="admin-order-date">
                          {formatDate(order.created_at)}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td>
                        <button
                          type="button"
                          className="admin-view-order-btn"
                          title="View order"
                          onClick={() => viewOrder(order.id)}
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

            <div className="orders-pagination">
              <span>
                Showing{" "}
                <strong>
                  {pagination.totalOrders === 0
                    ? 0
                    : (pagination.currentPage - 1) * pagination.limit + 1}
                </strong>{" "}
                to{" "}
                <strong>
                  {pagination.totalOrders === 0
                    ? 0
                    : Math.min(
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

                {/* CURRENT PAGE */}

                <span>
                  {pagination.currentPage} / {pagination.totalPages || 1}
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
          </>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
