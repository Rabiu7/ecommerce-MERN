import "./AdminCustomers.css";

import { useCallback, useEffect, useRef, useState } from "react";
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
  FiX,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiClock,
  FiMapPin,
  FiArrowLeft,
  FiExternalLink,
  FiUser,
  FiAlertCircle,
  FiInbox,
} from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const PAGE_LIMIT = 10;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name) => {
  if (!name) return "CU";

  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

const normalizeStatus = (status) =>
  String(status || "pending")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-");

const getStatusLabel = (status) =>
  String(status || "Pending")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersCustomer, setOrdersCustomer] = useState(null);

  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const searchTimer = useRef(null);
  const requestId = useRef(0);

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("accessToken");

  const getHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchCustomers = useCallback(
    async ({ showRefresh = false } = {}) => {
      const currentRequest = ++requestId.current;

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_LIMIT),
          search: debouncedSearch,
        });

        const response = await fetch(
          `${VITE_API_URL}/api/admin/customers?${params.toString()}`,
          {
            method: "GET",
            headers: getHeaders(),
          },
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Unable to load customers.",
          );
        }

        if (currentRequest !== requestId.current) return;

        const customerList = Array.isArray(data.customers)
          ? data.customers
          : Array.isArray(data.data?.customers)
            ? data.data.customers
            : [];

        setCustomers(customerList);
        setSummary(data.summary || data.data?.summary || {});

        const paginationData = data.pagination || data.data?.pagination || {};

        const total = Number(
          paginationData.total ??
            paginationData.totalCustomers ??
            paginationData.totalRecords ??
            data.total ??
            customerList.length,
        );

        const totalPages = Number(
          paginationData.totalPages ??
            paginationData.pages ??
            Math.max(1, Math.ceil(total / PAGE_LIMIT)),
        );

        setPagination({
          page: Number(paginationData.page ?? page),
          total,
          totalPages: Math.max(1, totalPages),
        });
      } catch (err) {
        if (currentRequest !== requestId.current) return;

        setError(err.message || "Something went wrong.");
        setCustomers([]);
        setSummary({});
        setPagination({
          page,
          totalPages: 1,
          total: 0,
        });
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [page, debouncedSearch],
  );

  useEffect(() => {
    clearTimeout(searchTimer.current);

    searchTimer.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(searchTimer.current);
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedCustomer(null);
        setOrdersCustomer(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleRefresh = () => {
    fetchCustomers({ showRefresh: true });
  };

  const handlePageChange = (nextPage) => {
    const safePage = Math.min(Math.max(1, nextPage), pagination.totalPages);

    if (safePage !== page) {
      setPage(safePage);
    }
  };

  const openCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
  };

  const closeCustomerDetails = () => {
    setSelectedCustomer(null);
  };

  const openCustomerOrders = async (customer) => {
    setSelectedCustomer(null);
    setOrdersCustomer(customer);
    setCustomerOrders([]);
    setOrdersError("");
    setOrdersLoading(true);

    try {
      const customerId = customer.id ?? customer.customer_id;

      if (customerId == null) {
        throw new Error("Customer ID is missing.");
      }

      const response = await fetch(
        `${VITE_API_URL}/api/admin/customers/${encodeURIComponent(
          customerId,
        )}/orders`,
        {
          method: "GET",
          headers: getHeaders(),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to load order history.",
        );
      }

      const orderList = Array.isArray(data.orders)
        ? data.orders
        : Array.isArray(data.data?.orders)
          ? data.data.orders
          : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];

      setCustomerOrders(orderList);
    } catch (err) {
      setOrdersError(err.message || "Unable to load order history.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const closeCustomerOrders = () => {
    setOrdersCustomer(null);
    setCustomerOrders([]);
    setOrdersError("");
  };

  const totalCustomers = Number(
    summary.totalCustomers ?? summary.total_customers ?? pagination.total,
  );

  const totalOrders = Number(summary.totalOrders ?? summary.total_orders ?? 0);

  const totalRevenue = Number(
    summary.totalSpent ??
      summary.total_spent ??
      summary.totalRevenue ??
      summary.total_revenue ??
      0,
  );

  const activeCustomerCount = Number(
    summary.activeCustomers ?? summary.active_customers ?? 0,
  );

  const displayedStart =
    pagination.total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;

  const displayedEnd = Math.min(page * PAGE_LIMIT, pagination.total);

  return (
    <div className="admin-customers-page">
      <header className="admin-customers-header">
        <div className="admin-customers-heading">
          <span className="admin-customers-label">CUSTOMER MANAGEMENT</span>

          <h1>Customers</h1>

          <p>
            Manage your customers, review their activity, and track purchase
            history.
          </p>
        </div>

        <button
          type="button"
          className="customers-refresh-btn"
          onClick={handleRefresh}
          disabled={loading || refreshing}
        >
          <FiRefreshCw
            className={loading || refreshing ? "customers-spin" : ""}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </header>

      {error && (
        <div className="customers-error" role="alert">
          <div className="customers-error-message">
            <FiAlertCircle />
            <span>{error}</span>
          </div>

          <button type="button" onClick={handleRefresh}>
            Try again
          </button>
        </div>
      )}

      <section className="customers-summary">
        <article className="customers-summary-card">
          <div className="customers-summary-top">
            <span>Total customers</span>
            <span className="customers-summary-icon">
              <FiUsers />
            </span>
          </div>
          <strong>
            {loading && !customers.length
              ? "—"
              : totalCustomers.toLocaleString("en-IN")}
          </strong>
          <small>Registered customer accounts</small>
        </article>

        <article className="customers-summary-card">
          <div className="customers-summary-top">
            <span>Total orders</span>
            <span className="customers-summary-icon">
              <FiShoppingBag />
            </span>
          </div>
          <strong>
            {loading && !customers.length
              ? "—"
              : totalOrders.toLocaleString("en-IN")}
          </strong>
          <small>Orders across all customers</small>
        </article>

        <article className="customers-summary-card">
          <div className="customers-summary-top">
            <span>Total spending</span>
            <span className="customers-summary-icon">
              <FiDollarSign />
            </span>
          </div>
          <strong className="customers-summary-money">
            {loading && !customers.length ? "—" : formatCurrency(totalRevenue)}
          </strong>
          <small>Reported customer order value</small>
        </article>

        <article className="customers-summary-card">
          <div className="customers-summary-top">
            <span>Active customers</span>
            <span className="customers-summary-icon">
              <FiUser />
            </span>
          </div>
          <strong>
            {loading && !customers.length
              ? "—"
              : activeCustomerCount.toLocaleString("en-IN")}
          </strong>
          <small>As reported by your API</small>
        </article>
      </section>

      <section className="admin-customers-card">
        <div className="customers-toolbar">
          <div className="customers-toolbar-heading">
            <h2>Customer directory</h2>
            <p>Search and view customer information.</p>
          </div>

          <label className="customers-search">
            <FiSearch />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or phone..."
              aria-label="Search customers"
            />

            {search && (
              <button
                type="button"
                className="customers-clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </label>
        </div>

        {loading && !customers.length ? (
          <div className="customers-loading">
            <span className="customers-loading-spinner" />
            <h3>Loading customers</h3>
            <p>Please wait while we retrieve customer information.</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="customers-empty">
            <div className="customers-empty-icon">
              <FiInbox />
            </div>

            <h3>
              {debouncedSearch ? "No matching customers" : "No customers found"}
            </h3>

            <p>
              {debouncedSearch
                ? "Try a different name, email address, or phone number."
                : "Customer accounts will appear here when available."}
            </p>

            {debouncedSearch && (
              <button
                type="button"
                className="customers-reset-btn"
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="customers-table-wrapper">
              <table className="admin-customers-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact information</th>
                    <th>Orders</th>
                    <th>Total spent</th>
                    <th>Joined date</th>
                    <th className="customers-actions-heading">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer, index) => {
                    const customerId =
                      customer.id ?? customer.customer_id ?? index;

                    const customerName =
                      customer.name ||
                      customer.full_name ||
                      customer.customer_name ||
                      "Unnamed customer";

                    const email = customer.email || "—";
                    const phone = customer.phone || "—";

                    return (
                      <tr key={customerId}>
                        <td>
                          <div className="customers-customer-cell">
                            <div className="customers-avatar">
                              {getInitials(customerName)}
                            </div>

                            <div className="customers-customer-info">
                              <strong title={customerName}>
                                {customerName}
                              </strong>
                              <span>
                                ID: {customer.id ?? customer.customer_id ?? "—"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="customers-contact-cell">
                            <span title={email}>
                              <FiMail />
                              <span>{email}</span>
                            </span>

                            <span title={phone}>
                              <FiPhone />
                              <span>{phone}</span>
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="customers-orders-count">
                            <FiShoppingBag />
                            {Number(
                              customer.total_orders ??
                                customer.totalOrders ??
                                0,
                            )}
                          </span>
                        </td>

                        <td>
                          <strong className="customers-spent">
                            {formatCurrency(
                              customer.total_spent ?? customer.totalSpent ?? 0,
                            )}
                          </strong>
                        </td>

                        <td>
                          <span className="customers-joined-date">
                            <FiCalendar />
                            {formatDate(
                              customer.created_at ?? customer.createdAt,
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="customers-row-actions">
                            <button
                              type="button"
                              className="customers-action-btn"
                              title="View customer details"
                              aria-label={`View details for ${customerName}`}
                              onClick={() => openCustomerDetails(customer)}
                            >
                              <FiEye />
                            </button>

                            <button
                              type="button"
                              className="customers-action-btn customers-orders-btn"
                              title="View order history"
                              aria-label={`View orders for ${customerName}`}
                              onClick={() => openCustomerOrders(customer)}
                            >
                              <FiShoppingBag />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <footer className="customers-pagination">
              <span>
                Showing{" "}
                <strong>
                  {displayedStart}–{displayedEnd}
                </strong>{" "}
                of <strong>{pagination.total}</strong> customers
              </span>

              <div className="customers-pagination-controls">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || loading}
                  aria-label="Previous page"
                >
                  <FiChevronLeft />
                </button>

                <span>
                  Page <strong>{page}</strong> of{" "}
                  <strong>{pagination.totalPages}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.totalPages || loading}
                  aria-label="Next page"
                >
                  <FiChevronRight />
                </button>
              </div>
            </footer>
          </>
        )}
      </section>

      {selectedCustomer && (
        <div
          className="customers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCustomerDetails();
            }
          }}
        >
          <section
            className="customers-modal customers-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customers-profile-title"
          >
            <div className="customers-modal-header">
              <div>
                <span className="customers-modal-eyebrow">
                  CUSTOMER PROFILE
                </span>
                <h2 id="customers-profile-title">Customer details</h2>
              </div>

              <button
                type="button"
                className="customers-modal-close"
                onClick={closeCustomerDetails}
                aria-label="Close customer details"
              >
                <FiX />
              </button>
            </div>

            <div className="customers-profile-banner">
              <div className="customers-profile-avatar">
                {getInitials(
                  selectedCustomer.name ||
                    selectedCustomer.full_name ||
                    selectedCustomer.customer_name,
                )}
              </div>

              <div className="customers-profile-heading">
                <h3>
                  {selectedCustomer.name ||
                    selectedCustomer.full_name ||
                    selectedCustomer.customer_name ||
                    "Unnamed customer"}
                </h3>
                <p>
                  Customer ID:{" "}
                  {selectedCustomer.id ?? selectedCustomer.customer_id ?? "—"}
                </p>
              </div>
            </div>

            <div className="customers-profile-stats">
              <div>
                <span>Total orders</span>
                <strong>
                  {Number(
                    selectedCustomer.total_orders ??
                      selectedCustomer.totalOrders ??
                      0,
                  )}
                </strong>
              </div>

              <div>
                <span>Total spent</span>
                <strong>
                  {formatCurrency(
                    selectedCustomer.total_spent ??
                      selectedCustomer.totalSpent ??
                      0,
                  )}
                </strong>
              </div>
            </div>

            <div className="customers-detail-section">
              <h3>Contact information</h3>

              <div className="customers-detail-list">
                <div className="customers-detail-item">
                  <span className="customers-detail-icon">
                    <FiMail />
                  </span>
                  <div>
                    <small>Email address</small>
                    <strong>{selectedCustomer.email || "Not provided"}</strong>
                  </div>
                </div>

                <div className="customers-detail-item">
                  <span className="customers-detail-icon">
                    <FiPhone />
                  </span>
                  <div>
                    <small>Phone number</small>
                    <strong>{selectedCustomer.phone || "Not provided"}</strong>
                  </div>
                </div>

                <div className="customers-detail-item">
                  <span className="customers-detail-icon">
                    <FiCalendar />
                  </span>
                  <div>
                    <small>Registered on</small>
                    <strong>
                      {formatDateTime(
                        selectedCustomer.created_at ??
                          selectedCustomer.createdAt,
                      )}
                    </strong>
                  </div>
                </div>

                {(selectedCustomer.address ||
                  selectedCustomer.city ||
                  selectedCustomer.state) && (
                  <div className="customers-detail-item">
                    <span className="customers-detail-icon">
                      <FiMapPin />
                    </span>
                    <div>
                      <small>Address</small>
                      <strong>
                        {[
                          selectedCustomer.address,
                          selectedCustomer.city,
                          selectedCustomer.state,
                          selectedCustomer.postal_code ??
                            selectedCustomer.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="customers-modal-footer">
              <button
                type="button"
                className="customers-secondary-btn"
                onClick={closeCustomerDetails}
              >
                Close
              </button>

              <button
                type="button"
                className="customers-primary-btn"
                onClick={() => openCustomerOrders(selectedCustomer)}
              >
                <FiShoppingBag />
                View order history
              </button>
            </div>
          </section>
        </div>
      )}

      {ordersCustomer && (
        <div
          className="customers-modal-overlay customers-orders-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCustomerOrders();
            }
          }}
        >
          <section
            className="customers-modal customers-orders-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customers-orders-title"
          >
            <div className="customers-modal-header">
              <div>
                <span className="customers-modal-eyebrow">
                  PURCHASE ACTIVITY
                </span>
                <h2 id="customers-orders-title">Order history</h2>
                <p className="customers-orders-subtitle">
                  {ordersCustomer.name ||
                    ordersCustomer.full_name ||
                    ordersCustomer.customer_name ||
                    ordersCustomer.email ||
                    "Customer"}
                </p>
              </div>

              <button
                type="button"
                className="customers-modal-close"
                onClick={closeCustomerOrders}
                aria-label="Close order history"
              >
                <FiX />
              </button>
            </div>

            {ordersLoading ? (
              <div className="customers-orders-loading">
                <span className="customers-loading-spinner" />
                <h3>Loading order history</h3>
                <p>Retrieving this customer's orders.</p>
              </div>
            ) : ordersError ? (
              <div className="customers-orders-error">
                <FiAlertCircle />
                <h3>Unable to load orders</h3>
                <p>{ordersError}</p>
                <button
                  type="button"
                  className="customers-primary-btn"
                  onClick={() => openCustomerOrders(ordersCustomer)}
                >
                  <FiRefreshCw />
                  Try again
                </button>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="customers-empty customers-orders-empty">
                <div className="customers-empty-icon">
                  <FiPackage />
                </div>
                <h3>No orders yet</h3>
                <p>This customer does not have any orders to display.</p>
              </div>
            ) : (
              <div className="customers-order-list">
                {customerOrders.map((order, orderIndex) => {
                  const orderId =
                    order.id ??
                    order.order_id ??
                    order.public_order_id ??
                    orderIndex;

                  const items = Array.isArray(order.items)
                    ? order.items
                    : Array.isArray(order.order_items)
                      ? order.order_items
                      : [];

                  const orderStatus =
                    order.order_status ?? order.status ?? "pending";

                  const paymentStatus = order.payment_status ?? "—";

                  const paymentMethod = order.payment_method ?? "—";

                  return (
                    <article className="customers-order-card" key={orderId}>
                      <div className="customers-order-card-header">
                        <div>
                          <span className="customers-order-reference">
                            ORDER REFERENCE
                          </span>
                          <h3>
                            {order.public_order_id ||
                              order.order_number ||
                              `#${order.id ?? order.order_id ?? orderIndex + 1}`}
                          </h3>
                          <p>
                            <FiCalendar />
                            {formatDateTime(
                              order.created_at ?? order.createdAt,
                            )}
                          </p>
                        </div>

                        <span
                          className={`customers-status-badge status-${normalizeStatus(
                            orderStatus,
                          )}`}
                        >
                          {getStatusLabel(orderStatus)}
                        </span>
                      </div>

                      {items.length > 0 && (
                        <div className="customers-order-items">
                          {items.map((item, itemIndex) => {
                            const itemId =
                              item.id ??
                              item.product_id ??
                              `${orderId}-${itemIndex}`;

                            const productName =
                              item.product_name || item.name || "Product";

                            const productImage =
                              item.product_image ||
                              item.image ||
                              item.image_url;

                            return (
                              <div
                                className="customers-order-item"
                                key={itemId}
                              >
                                <div className="customers-product-image">
                                  {productImage ? (
                                    <img
                                      src={productImage}
                                      alt={productName}
                                      loading="lazy"
                                      onError={(event) => {
                                        event.currentTarget.style.display =
                                          "none";
                                      }}
                                    />
                                  ) : (
                                    <FiPackage />
                                  )}
                                </div>

                                <div className="customers-product-info">
                                  <strong title={productName}>
                                    {productName}
                                  </strong>
                                  <span>Qty: {Number(item.quantity) || 1}</span>
                                </div>

                                <strong className="customers-product-price">
                                  {formatCurrency(
                                    (Number(item.price) || 0) *
                                      (Number(item.quantity) || 1),
                                  )}
                                </strong>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="customers-order-meta">
                        <div>
                          <small>Payment method</small>
                          <strong>{getStatusLabel(paymentMethod)}</strong>
                        </div>

                        <div>
                          <small>Payment status</small>
                          <span
                            className={`customers-status-badge status-${normalizeStatus(
                              paymentStatus,
                            )}`}
                          >
                            {getStatusLabel(paymentStatus)}
                          </span>
                        </div>

                        <div className="customers-order-total">
                          <small>Order total</small>
                          <strong>
                            {formatCurrency(
                              order.total_amount ??
                                order.total ??
                                order.grand_total ??
                                order.amount ??
                                0,
                            )}
                          </strong>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="customers-modal-footer">
              <button
                type="button"
                className="customers-secondary-btn"
                onClick={closeCustomerOrders}
              >
                <FiArrowLeft />
                Back to customers
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
