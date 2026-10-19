import "./Orders.css";
import { useCallback, useEffect, useRef, useState } from "react";
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
  FiCalendar,
  FiShoppingCart,
  FiBox,
  FiFilter,
  FiArrowUpRight,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const FILTERS = [
  { id: "all", label: "All orders" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "confirmed", label: "Confirmed" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
  { id: "failed", label: "Failed" },
];

const EMPTY_STATS = {
  all: 0,
  pending: 0,
  processing: 0,
  shipped: 0,
  delivered: 0,
  failed: 0,
  cancelled: 0,
  confirmed: 0,
};

function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalOrders: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [orderStats, setOrderStats] = useState(EMPTY_STATS);

  const searchTimerRef = useRef(null);
  const requestRef = useRef(0);

  const fetchOrders = useCallback(
    async (page = 1, searchValue = "", status = "all") => {
      const requestId = ++requestRef.current;
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please sign in to view your orders.");
        }

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
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your orders.");
        }

        // Ignore outdated responses from earlier searches.
        if (requestId !== requestRef.current) return;

        setOrders(Array.isArray(data.orders) ? data.orders : []);

        if (data.pagination) {
          setPagination(data.pagination);
        }

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
      } catch (err) {
        if (requestId !== requestRef.current) return;

        setError(err.message || "Something went wrong.");
        setOrders([]);
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!user?.id) return;

    fetchOrders(1, "", "all");

    return () => {
      requestRef.current += 1;
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [user?.id, fetchOrders]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPagination((previous) => ({
      ...previous,
      currentPage: 1,
    }));

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      fetchOrders(1, value, activeFilter);
    }, 350);
  };

  const handleFilterChange = (status) => {
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

  const changePage = (page) => {
    if (loading || page < 1 || page > pagination.totalPages) {
      return;
    }

    fetchOrders(page, search, activeFilter);
  };

  const handleRefresh = () => {
    if (!loading) {
      fetchOrders(pagination.currentPage, search, activeFilter);
    }
  };

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

  const getStatusDetails = (status) => {
    const normalized = String(status || "pending").toLowerCase();

    const details = {
      delivered: {
        label: "Delivered",
        className: "delivered",
        icon: <FiCheckCircle />,
        description: "Your order has arrived",
      },
      shipped: {
        label: "Shipped",
        className: "shipped",
        icon: <FiTruck />,
        description: "Your order is on its way",
      },
      confirmed: {
        label: "Confirmed",
        className: "confirmed",
        icon: <FiCheckCircle />,
        description: "Your order is confirmed",
      },
      processing: {
        label: "Processing",
        className: "processing",
        icon: <FiPackage />,
        description: "We are preparing your order",
      },
      pending: {
        label: "Pending",
        className: "pending",
        icon: <FiClock />,
        description: "Awaiting order confirmation",
      },
      cancelled: {
        label: "Cancelled",
        className: "cancelled",
        icon: <FiXCircle />,
        description: "This order was cancelled",
      },
      failed: {
        label: "Failed",
        className: "failed",
        icon: <FiXCircle />,
        description: "This order could not be completed",
      },
    };

    return (
      details[normalized] || {
        label: status || "Pending",
        className: "pending",
        icon: <FiClock />,
        description: "Check your order for more details",
      }
    );
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  if (!user?.id) {
    return (
      <section className="ob-orders-page">
        <div className="ob-orders-message">
          <FiShoppingBag />
          <h2>Sign in to view your orders</h2>
          <p>Your purchases will be available here after you sign in.</p>
          <button onClick={() => navigate("/login")}>
            Sign In <FiArrowRight />
          </button>
        </div>
      </section>
    );
  }

  if (loading && orders.length === 0 && !error) {
    return (
      <section className="ob-orders-page ob-orders-loading-page">
        <div className="ob-orders-loading">
          <div className="ob-loading-icon">
            <FiShoppingBag />
          </div>
          <span className="ob-loading-spinner" />
          <h2>Preparing your orders</h2>
          <p>Your shopping history is on its way.</p>
        </div>
      </section>
    );
  }

  return (
    <main className="ob-orders-page">
      <div className="ob-orders-container">
        {/* PAGE INTRO */}

        <header className="ob-orders-header">
          <div className="ob-orders-heading">
            <div className="ob-orders-eyebrow">
              <span className="ob-eyebrow-mark">
                <FiShoppingBag />
              </span>
              YOUR ONLINE BAZAAR
            </div>

            <h1>
              Your orders<span>.</span>
            </h1>

            <p>Every purchase, every update, all in one place.</p>
          </div>

          <button
            type="button"
            className="ob-shop-button"
            onClick={() => navigate("/products")}
          >
            <FiShoppingCart />
            Continue shopping
            <FiArrowUpRight />
          </button>
        </header>

        {/* OVERVIEW */}

        <section className="ob-order-overview">
          <div className="ob-overview-heading">
            <span className="ob-section-kicker">AT A GLANCE</span>
            <h2>Order overview</h2>
            <p>A quick look at your shopping activity.</p>
          </div>

          <div className="ob-order-stats">
            <article className="ob-order-stat ob-stat-total">
              <div className="ob-stat-top">
                <span>Total orders</span>
                <div className="ob-stat-icon">
                  <FiBox />
                </div>
              </div>
              <strong>{orderStats.all}</strong>
              <span className="ob-stat-foot">All your purchases</span>
            </article>

            <article className="ob-order-stat ob-stat-pending">
              <div className="ob-stat-top">
                <span>In progress</span>
                <div className="ob-stat-icon">
                  <FiClock />
                </div>
              </div>
              <strong>
                {orderStats.pending +
                  orderStats.processing +
                  orderStats.confirmed}
              </strong>
              <span className="ob-stat-foot">Being prepared</span>
            </article>

            <article className="ob-order-stat ob-stat-shipped">
              <div className="ob-stat-top">
                <span>On the way</span>
                <div className="ob-stat-icon">
                  <FiTruck />
                </div>
              </div>
              <strong>{orderStats.shipped}</strong>
              <span className="ob-stat-foot">Shipped orders</span>
            </article>

            <article className="ob-order-stat ob-stat-delivered">
              <div className="ob-stat-top">
                <span>Completed</span>
                <div className="ob-stat-icon">
                  <FiCheckCircle />
                </div>
              </div>
              <strong>{orderStats.delivered}</strong>
              <span className="ob-stat-foot">Successfully delivered</span>
            </article>
          </div>
        </section>

        {/* ORDER HISTORY */}

        <section className="ob-order-history">
          <div className="ob-history-heading">
            <div>
              <span className="ob-section-kicker">YOUR PURCHASES</span>
              <h2>Order history</h2>
              <p>Find a purchase and check its latest status.</p>
            </div>

            <button
              type="button"
              className="ob-refresh-button"
              onClick={handleRefresh}
              disabled={loading}
              aria-label="Refresh orders"
              title="Refresh orders"
            >
              <FiRefreshCw className={loading ? "ob-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          {/* SEARCH */}

          <div className="ob-order-controls">
            <div className="ob-order-search">
              <FiSearch />
              <input
                type="search"
                placeholder="Search by order ID..."
                value={search}
                onChange={handleSearchChange}
                aria-label="Search orders by order ID"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    if (searchTimerRef.current) {
                      clearTimeout(searchTimerRef.current);
                    }
                    setPagination((previous) => ({
                      ...previous,
                      currentPage: 1,
                    }));
                    fetchOrders(1, "", activeFilter);
                  }}
                  aria-label="Clear search"
                >
                  <FiXCircle />
                </button>
              )}
            </div>

            <div className="ob-filter-label">
              <FiFilter />
              Filter by status
            </div>
          </div>

          {/* FILTER PILLS */}

          <div
            className="ob-order-filters"
            role="group"
            aria-label="Filter orders"
          >
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={
                  activeFilter === filter.id
                    ? "ob-filter-pill active"
                    : "ob-filter-pill"
                }
                onClick={() => handleFilterChange(filter.id)}
                aria-pressed={activeFilter === filter.id}
              >
                {filter.label}
                <span>
                  {filter.id === "all"
                    ? orderStats.all
                    : (orderStats[filter.id] ?? 0)}
                </span>
              </button>
            ))}
          </div>

          {/* RESULTS */}

          <div className="ob-results-summary">
            <span>
              Showing <strong>{pagination.totalOrders}</strong>{" "}
              {pagination.totalOrders === 1 ? "order" : "orders"}
            </span>

            {search && (
              <span className="ob-search-summary">
                Search: <strong>{search}</strong>
              </span>
            )}
          </div>

          {error ? (
            <div className="ob-orders-empty">
              <div className="ob-empty-icon error">
                <FiXCircle />
              </div>
              <h3>We couldn't load your orders</h3>
              <p>{error}</p>
              <button
                type="button"
                onClick={() =>
                  fetchOrders(pagination.currentPage, search, activeFilter)
                }
              >
                <FiRefreshCw /> Try again
              </button>
            </div>
          ) : loading ? (
            <div className="ob-orders-inline-loading">
              <span className="ob-loading-spinner" />
              <p>Updating your orders...</p>
            </div>
          ) : orderStats.all === 0 ? (
            <div className="ob-orders-empty">
              <div className="ob-empty-icon">
                <FiShoppingBag />
              </div>
              <span className="ob-section-kicker">A FRESH START</span>
              <h3>Your first order starts here</h3>
              <p>
                You haven't placed an order yet. Explore the collection and find
                something you love.
              </p>
              <button type="button" onClick={() => navigate("/products")}>
                Explore products <FiArrowRight />
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="ob-orders-empty">
              <div className="ob-empty-icon">
                <FiSearch />
              </div>
              <h3>No matching orders</h3>
              <p>Try another order ID or choose a different status.</p>
              <button type="button" onClick={clearFilters}>
                Clear filters <FiArrowRight />
              </button>
            </div>
          ) : (
            <div className="ob-order-list">
              {orders.map((order) => {
                const status = getStatusDetails(order.order_status);

                return (
                  <article
                    className="ob-order-card"
                    key={order.public_order_id}
                  >
                    <div className="ob-order-card-top">
                      <div className="ob-order-identity">
                        <div className="ob-order-package-icon">
                          <FiPackage />
                        </div>
                        <div className="ob-order-id-copy">
                          <span>ORDER NUMBER</span>
                          <h3>#{order.public_order_id}</h3>
                        </div>
                      </div>

                      <div className={`ob-order-status ${status.className}`}>
                        {status.icon}
                        <span>{status.label}</span>
                      </div>
                    </div>

                    <div className="ob-order-card-divider" />

                    <div className="ob-order-card-details">
                      <div className="ob-order-detail">
                        <span className="ob-detail-label">
                          <FiCalendar /> ORDER DATE
                        </span>
                        <strong>{formatDate(order.created_at)}</strong>
                      </div>

                      <div className="ob-order-detail">
                        <span className="ob-detail-label">
                          <FiShoppingBag /> ORDER TOTAL
                        </span>
                        <strong className="ob-order-total">
                          {formatAmount(order.total_amount)}
                        </strong>
                      </div>

                      <div className="ob-order-detail ob-order-status-detail">
                        <span className="ob-detail-label">LATEST UPDATE</span>
                        <strong>{status.description}</strong>
                      </div>

                      <button
                        type="button"
                        className="ob-view-order-button"
                        onClick={() =>
                          navigate(
                            `/orders/${encodeURIComponent(order.public_order_id)}`,
                          )
                        }
                      >
                        View details <FiChevronRight />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}

          {!error && pagination.totalPages > 0 && orders.length > 0 && (
            <footer className="ob-orders-pagination">
              <p>
                Page <strong>{pagination.currentPage}</strong> of{" "}
                <strong>{pagination.totalPages}</strong>
                <span className="ob-pagination-total">
                  {" "}
                  · {pagination.totalOrders} total orders
                </span>
              </p>

              <div className="ob-pagination-buttons">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage || loading}
                  onClick={() => changePage(pagination.currentPage - 1)}
                  aria-label="Previous page"
                >
                  <FiChevronLeft />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage || loading}
                  onClick={() => changePage(pagination.currentPage + 1)}
                  aria-label="Next page"
                >
                  Next
                  <FiChevronRight />
                </button>
              </div>
            </footer>
          )}
        </section>

        {/* FOOTER NOTE */}

        <footer className="ob-orders-footer">
          <div className="ob-footer-mark">
            <FiShoppingBag />
          </div>
          <p>
            Thank you for shopping with <strong>Online Bazaar.</strong>
          </p>
          <button type="button" onClick={() => navigate("/products")}>
            Discover more <FiArrowRight />
          </button>
        </footer>
      </div>
    </main>
  );
}

export default Orders;
