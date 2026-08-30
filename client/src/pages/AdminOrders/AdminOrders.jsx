import "./AdminOrders.css";

import { useEffect, useMemo, useState } from "react";

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
  const [orders, setOrders] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const ordersPerPage = 10;

  // =========================================================
  // FETCH ORDERS
  // =========================================================

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${VITE_API_URL}/api/admin/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      console.log("Admin orders:", data);

      setOrders(Array.isArray(data.orders) ? data.orders : []);

      setCurrentPage(1);
    } catch (error) {
      console.error("Admin orders error:", error);

      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
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
  // FILTER ORDERS
  // =========================================================

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        String(order.id).toLowerCase().includes(search) ||
        String(order.customer_name || "")
          .toLowerCase()
          .includes(search) ||
        String(order.customer_email || "")
          .toLowerCase()
          .includes(search) ||
        String(order.customer_phone || "")
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        String(order.order_status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const startIndex = (currentPage - 1) * ordersPerPage;

  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + ordersPerPage,
  );

  // =========================================================
  // STATUS COUNTS
  // =========================================================

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,

      pending: orders.filter(
        (order) => order.order_status?.toLowerCase() === "pending",
      ).length,

      confirmed: orders.filter(
        (order) => order.order_status?.toLowerCase() === "confirmed",
      ).length,

      processing: orders.filter(
        (order) => order.order_status?.toLowerCase() === "processing",
      ).length,

      shipped: orders.filter(
        (order) => order.order_status?.toLowerCase() === "shipped",
      ).length,

      delivered: orders.filter(
        (order) => order.order_status?.toLowerCase() === "delivered",
      ).length,

      cancelled: orders.filter(
        (order) => order.order_status?.toLowerCase() === "cancelled",
      ).length,
    };
  }, [orders]);

  // =========================================================
  // CHANGE PAGE
  // =========================================================

  const changePage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
  };

  // =========================================================
  // VIEW ORDER
  // =========================================================

  const viewOrder = (orderId) => {
    window.location.href = `/admin/orders/${orderId}`;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
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
          onClick={fetchOrders}
        >
          <FiRefreshCw />

          <span>Refresh</span>
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="admin-orders-error">
          <span>{error}</span>

          <button type="button" onClick={fetchOrders}>
            Try Again
          </button>
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="orders-summary">
        <button
          type="button"
          className={`order-summary-card ${
            statusFilter === "all" ? "active" : ""
          }`}
          onClick={() => {
            setStatusFilter("all");
            setCurrentPage(1);
          }}
        >
          <span>All Orders</span>

          <strong>{statusCounts.all}</strong>
        </button>

        <button
          type="button"
          className={`order-summary-card ${
            statusFilter === "pending" ? "active" : ""
          }`}
          onClick={() => {
            setStatusFilter("pending");
            setCurrentPage(1);
          }}
        >
          <span>Pending</span>

          <strong>{statusCounts.pending}</strong>
        </button>

        <button
          type="button"
          className={`order-summary-card ${
            statusFilter === "processing" ? "active" : ""
          }`}
          onClick={() => {
            setStatusFilter("processing");
            setCurrentPage(1);
          }}
        >
          <span>Processing</span>

          <strong>{statusCounts.processing}</strong>
        </button>

        <button
          type="button"
          className={`order-summary-card ${
            statusFilter === "shipped" ? "active" : ""
          }`}
          onClick={() => {
            setStatusFilter("shipped");
            setCurrentPage(1);
          }}
        >
          <span>Shipped</span>

          <strong>{statusCounts.shipped}</strong>
        </button>

        <button
          type="button"
          className={`order-summary-card ${
            statusFilter === "delivered" ? "active" : ""
          }`}
          onClick={() => {
            setStatusFilter("delivered");
            setCurrentPage(1);
          }}
        >
          <span>Delivered</span>

          <strong>{statusCounts.delivered}</strong>
        </button>

        <button
          type="button"
          className={`order-summary-card ${
            statusFilter === "cancelled" ? "active" : ""
          }`}
          onClick={() => {
            setStatusFilter("cancelled");
            setCurrentPage(1);
          }}
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
          <div className="orders-search">
            <FiSearch />

            <input
              type="text"
              placeholder="Search by order ID, customer, email or phone..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="orders-status-filter"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
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

        {currentOrders.length === 0 ? (
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
                  {currentOrders.map((order) => (
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
                  {filteredOrders.length === 0 ? 0 : startIndex + 1}
                </strong>{" "}
                to{" "}
                <strong>
                  {Math.min(startIndex + ordersPerPage, filteredOrders.length)}
                </strong>{" "}
                of <strong>{filteredOrders.length}</strong> orders
              </span>

              <div className="pagination-controls">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => changePage(currentPage - 1)}
                >
                  <FiChevronLeft />
                </button>

                <span>
                  {currentPage} / {totalPages || 1}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => changePage(currentPage + 1)}
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
