import "./AdminCustomers.css";

import { useEffect, useRef, useState } from "react";

import {
  FiUsers,
  FiSearch,
  FiEye,
  FiMail,
  FiPhone,
  FiShoppingBag,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminCustomers() {
  // =========================================================
  // STATE
  // =========================================================

  // Only customers from the current page.
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showCustomerOrders, setShowCustomerOrders] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  // Customers per page.
  const customersPerPage = 10;

  // Backend pagination information.
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: customersPerPage,
    totalCustomers: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Backend summary information.
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    customersWithOrders: 0,
  });

  // Used for search debounce.
  const searchTimerRef = useRef(null);

  // =========================================================
  // FETCH CUSTOMERS
  // =========================================================

  const fetchCustomers = async (page = currentPage, searchValue = search) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(customersPerPage),
        search: searchValue.trim(),
      });

      const response = await fetch(
        `${VITE_API_URL}/api/admin/customers?${params.toString()}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();

      console.log("Admin customers:", data);

      // -------------------------------------------------------
      // CUSTOMERS
      // -------------------------------------------------------

      setCustomers(Array.isArray(data.customers) ? data.customers : []);

      // -------------------------------------------------------
      // PAGINATION
      // -------------------------------------------------------

      if (data.pagination) {
        setPagination(data.pagination);
      }

      // -------------------------------------------------------
      // SUMMARY
      // -------------------------------------------------------

      if (data.summary) {
        setSummary({
          totalCustomers: Number(data.summary.totalCustomers) || 0,

          customersWithOrders: Number(data.summary.customersWithOrders) || 0,
        });
      }

      setCurrentPage(data.pagination?.currentPage || page);
    } catch (error) {
      console.error("Customers error:", error);

      setCustomers([]);

      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchCustomers(1, "");

    // Initial request only.
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
  // SEARCH
  // =========================================================

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearch(value);

    // Always start from page 1 when searching.
    setCurrentPage(1);

    // Cancel previous request timer.
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Wait 300ms before requesting backend.
    searchTimerRef.current = setTimeout(() => {
      fetchCustomers(1, value);
    }, 300);
  };

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    fetchCustomers(1, "");
  };

  const handleViewOrders = async () => {
    if (!selectedCustomer) {
      return;
    }

    try {
      setOrdersLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${VITE_API_URL}/api/admin/customers/${selectedCustomer.id}/orders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customer orders");
      }

      const data = await response.json();

      setCustomerOrders(Array.isArray(data.orders) ? data.orders : []);

      setShowCustomerOrders(true);
    } catch (error) {
      console.error("Customer orders error:", error);

      setCustomerOrders([]);
      alert("Failed to load customer orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    fetchCustomers(currentPage, search);
  };

  // =========================================================
  // CHANGE PAGE
  // =========================================================

  const changePage = (page) => {
    if (page < 1 || page > pagination.totalPages) {
      return;
    }

    setCurrentPage(page);

    fetchCustomers(page, search);
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
  // GET INITIALS
  // =========================================================

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase() || "CU"
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && customers.length === 0) {
    return (
      <div className="admin-customers">
        <div className="customers-loading">
          <div className="customers-spinner"></div>

          <span>Loading customers...</span>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="admin-customers">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="customers-header">
        <span>CUSTOMER MANAGEMENT</span>

        <div className="customers-title-row">
          <div>
            <h1>Customers</h1>

            <p>
              Manage your Masha Allah Creations customers and view their order
              history.
            </p>
          </div>

          <div className="customers-header-icon">
            <FiUsers />
          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="customers-error">
          <span>{error}</span>

          <button type="button" onClick={handleRefresh}>
            <FiRefreshCw />
            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          CUSTOMER SUMMARY
      ===================================================== */}

      <div className="customers-summary">
        {/* TOTAL CUSTOMERS */}

        <div className="customer-summary-card">
          <div>
            <span>Total Customers</span>

            <strong>{summary.totalCustomers.toLocaleString("en-IN")}</strong>
          </div>

          <div className="summary-icon">
            <FiUsers />
          </div>
        </div>

        {/* CUSTOMERS WITH ORDERS */}

        <div className="customer-summary-card">
          <div>
            <span>Customers With Orders</span>

            <strong>
              {summary.customersWithOrders.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="summary-icon orders">
            <FiShoppingBag />
          </div>
        </div>
      </div>

      {/* =====================================================
          CUSTOMER TABLE CARD
      ===================================================== */}

      <div className="customers-card">
        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="customers-card-header">
          <div>
            <h2>All Customers</h2>

            <p>
              {pagination.totalCustomers.toLocaleString("en-IN")} customer
              {pagination.totalCustomers !== 1 ? "s" : ""} total
            </p>
          </div>

          {/* SEARCH */}

          <div className="customer-search">
            <FiSearch />

            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={handleSearchChange}
            />

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="search-clear"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        {loading ? (
          <div className="orders-table-loading">
            <div className="customers-spinner"></div>

            <p>Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="customers-empty">
            <FiUsers />

            <strong>No customers found</strong>

            <p>
              {search
                ? "Try a different search."
                : "No customers have registered yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="customers-table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Customer</th>

                    <th>Contact</th>

                    <th>Orders</th>

                    <th>Total Spent</th>

                    <th>Joined</th>

                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => {
                    const initials = getInitials(customer.name);

                    return (
                      <tr key={customer.id}>
                        {/* CUSTOMER */}

                        <td>
                          <div className="customer-info">
                            <div className="customer-avatar">{initials}</div>

                            <div className="customer-name">
                              <strong>{customer.name || "-"}</strong>

                              <span>Customer #{customer.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}

                        <td>
                          <div className="customer-contact">
                            <span>
                              <FiMail />

                              {customer.email || "-"}
                            </span>

                            {customer.phone && (
                              <span>
                                <FiPhone />

                                {customer.phone}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ORDERS */}

                        <td>
                          <span className="order-count">
                            {Number(customer.total_orders || 0)}
                          </span>
                        </td>

                        {/* TOTAL SPENT */}

                        <td>
                          <strong className="customer-spent">
                            ₹
                            {Number(customer.total_spent || 0).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </strong>
                        </td>

                        {/* JOINED */}

                        <td>
                          <span className="customer-date">
                            {formatDate(customer.created_at)}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td>
                          <button
                            type="button"
                            className="view-customer-button"
                            title="View customer"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <FiEye />

                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

            <div className="customers-pagination">
              <span>
                Showing{" "}
                <strong>
                  {pagination.totalCustomers === 0
                    ? 0
                    : (pagination.currentPage - 1) * pagination.limit + 1}
                </strong>{" "}
                to{" "}
                <strong>
                  {pagination.totalCustomers === 0
                    ? 0
                    : Math.min(
                        pagination.currentPage * pagination.limit,
                        pagination.totalCustomers,
                      )}
                </strong>{" "}
                of <strong>{pagination.totalCustomers}</strong> customers
              </span>

              <div className="customers-pagination-controls">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage || loading}
                  onClick={() => changePage(pagination.currentPage - 1)}
                >
                  <FiChevronLeft />
                </button>

                <span>
                  {pagination.currentPage} / {pagination.totalPages || 1}
                </span>

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

      {/* =====================================================
          CUSTOMER DETAILS MODAL
      ===================================================== */}

      {selectedCustomer && (
        <div
          className="customer-modal-overlay"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="customer-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="customer-modal-header">
              <div>
                <span>CUSTOMER DETAILS</span>

                <h2>{selectedCustomer.name || "Customer"}</h2>
              </div>

              <button
                type="button"
                className="customer-modal-close"
                title="Close"
                onClick={() => setSelectedCustomer(null)}
              >
                ×
              </button>
            </div>

            {/* CUSTOMER PROFILE */}

            <div className="customer-modal-profile">
              <div className="customer-modal-avatar">
                {getInitials(selectedCustomer.name)}
              </div>

              <div>
                <strong>{selectedCustomer.name || "-"}</strong>

                <span>Customer #{selectedCustomer.id}</span>
              </div>
            </div>

            {/* CUSTOMER DETAILS */}

            <div className="customer-details-grid">
              <div className="customer-detail-item">
                <span>Email</span>

                <strong>{selectedCustomer.email || "-"}</strong>
              </div>

              <div className="customer-detail-item">
                <span>Phone</span>

                <strong>{selectedCustomer.phone || "-"}</strong>
              </div>

              <div className="customer-detail-item">
                <span>Total Orders</span>

                <strong>{Number(selectedCustomer.total_orders || 0)}</strong>
              </div>

              <div className="customer-detail-item">
                <span>Total Spent</span>

                <strong>
                  ₹
                  {Number(selectedCustomer.total_spent || 0).toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )}
                </strong>
              </div>

              <div className="customer-detail-item">
                <span>Joined</span>

                <strong>{formatDate(selectedCustomer.created_at)}</strong>
              </div>
            </div>

            {showCustomerOrders && selectedCustomer && (
              <div
                className="customer-modal-overlay"
                onClick={() => setShowCustomerOrders(false)}
              >
                <div
                  className="customer-orders-modal"
                  onClick={(event) => event.stopPropagation()}
                >
                  {/* HEADER */}

                  <div className="customer-modal-header">
                    <div>
                      <span>CUSTOMER ORDERS</span>

                      <h2>{selectedCustomer.name || "Customer"}</h2>
                    </div>

                    <button
                      type="button"
                      className="customer-modal-close"
                      title="Close"
                      onClick={() => setShowCustomerOrders(false)}
                    >
                      ×
                    </button>
                  </div>

                  {/* ORDER COUNT */}

                  <div className="customer-orders-summary">
                    <div>
                      <span>Total Orders</span>

                      <strong>{customerOrders.length}</strong>
                    </div>

                    <div>
                      <span>Total Spent</span>

                      <strong>
                        ₹
                        {customerOrders
                          .reduce(
                            (total, order) =>
                              total + Number(order.total_amount || 0),
                            0,
                          )
                          .toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </strong>
                    </div>
                  </div>

                  {/* ORDERS */}

                  {ordersLoading ? (
                    <div className="customer-orders-loading">
                      <div className="customers-spinner"></div>

                      <p>Loading orders...</p>
                    </div>
                  ) : customerOrders.length === 0 ? (
                    <div className="customer-orders-empty">
                      <FiShoppingBag />

                      <strong>No orders found</strong>

                      <p>This customer has not placed any orders yet.</p>
                    </div>
                  ) : (
                    <div className="customer-orders-list">
                      {customerOrders.map((order) => (
                        <div className="customer-order-card" key={order.id}>
                          {/* ORDER HEADER */}

                          <div className="customer-order-header">
                            <div>
                              <span>Order</span>

                              <strong>
                                #{order.public_order_id || order.id}
                              </strong>

                              <small>{formatDate(order.created_at)}</small>
                            </div>

                            <div className="customer-order-status">
                              <span
                                className={order.order_status?.toLowerCase()}
                              >
                                {order.order_status || "Pending"}
                              </span>
                            </div>
                          </div>

                          {/* PRODUCTS */}

                          <div className="customer-order-products">
                            {order.items?.map((item, index) => (
                              <div
                                className="customer-order-product"
                                key={`${order.id}-${item.product_id}-${index}`}
                              >
                                <div className="customer-order-product-image">
                                  {item.product_image ? (
                                    <img
                                      src={
                                        item.product_image.startsWith("http")
                                          ? item.product_image
                                          : `${VITE_API_URL}${item.product_image}`
                                      }
                                      alt={item.product_name || "Product"}
                                    />
                                  ) : (
                                    <div className="customer-order-no-image">
                                      <FiShoppingBag />
                                    </div>
                                  )}
                                </div>

                                <div className="customer-order-product-info">
                                  <strong>
                                    {item.product_name || "Product"}
                                  </strong>

                                  <span>Qty: {item.quantity}</span>

                                  <span>
                                    ₹
                                    {Number(item.price || 0).toLocaleString(
                                      "en-IN",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      },
                                    )}
                                  </span>
                                </div>

                                <strong className="customer-order-item-total">
                                  ₹
                                  {(
                                    Number(item.price || 0) *
                                    Number(item.quantity || 0)
                                  ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </strong>
                              </div>
                            ))}
                          </div>

                          {/* ORDER FOOTER */}

                          <div className="customer-order-footer">
                            <div>
                              <span>Payment</span>

                              <strong>{order.payment_status || "-"}</strong>
                            </div>

                            <div>
                              <span>Method</span>

                              <strong>{order.payment_method || "-"}</strong>
                            </div>

                            <div className="customer-order-total">
                              <span>Total</span>

                              <strong>
                                ₹
                                {Number(order.total_amount || 0).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )}
                              </strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* FOOTER */}

                  <div className="customer-modal-footer">
                    <button
                      type="button"
                      onClick={() => setShowCustomerOrders(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL FOOTER */}

            <div className="customer-modal-footer">
              <button
                type="button"
                className="view-orders-button"
                onClick={handleViewOrders}
                disabled={ordersLoading}
              >
                <FiShoppingBag />

                {ordersLoading ? "Loading..." : "View Orders"}
              </button>

              <button type="button" onClick={() => setSelectedCustomer(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
