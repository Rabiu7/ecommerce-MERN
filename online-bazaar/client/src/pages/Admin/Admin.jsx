import "./Admin.css";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiShoppingBag,
  FiUsers,
  FiPackage,
  FiPlus,
  FiGrid,
  FiRefreshCw,
  FiTrendingUp,
  FiDollarSign,
  FiActivity,
  FiTag,
  FiMessageSquare,
} from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Admin() {
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStatistics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${VITE_API_URL}/api/admin/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load dashboard statistics");
      }

      const data = await response.json();

      setStatistics({
        totalRevenue: Number(data.revenue || 0),
        totalOrders: Number(data.orders || 0),
        totalUsers: Number(data.users || 0),
        totalProducts: Number(data.products || 0),
      });
    } catch (err) {
      console.error("Dashboard statistics error:", err);
      setError("Dashboard statistics could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

  const formatRevenue = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const statCards = [
    {
      label: "Total orders",
      value: statistics.totalOrders,
      description: "Orders in your store",
      icon: <FiShoppingBag />,
      className: "orders",
      link: "/admin/orders",
      linkLabel: "View orders",
    },
    {
      label: "Total customers",
      value: statistics.totalUsers,
      description: "Registered accounts",
      icon: <FiUsers />,
      className: "customers",
      link: "/admin/customers",
      linkLabel: "View customers",
    },
    {
      label: "Total products",
      value: statistics.totalProducts,
      description: "Products in catalogue",
      icon: <FiPackage />,
      className: "products",
      link: "/admin/products",
      linkLabel: "View products",
    },
  ];

  const managementCards = [
    {
      title: "Products",
      description: "Manage your catalogue, product details and availability.",
      icon: <FiPackage />,
      link: "/admin/products",
      label: "Manage catalogue",
      className: "products",
    },
    {
      title: "Orders",
      description: "Review purchases and manage customer orders.",
      icon: <FiShoppingBag />,
      link: "/admin/orders",
      label: "Manage orders",
      className: "orders",
    },
    {
      title: "Customers",
      description: "View customer accounts and their shopping activity.",
      icon: <FiUsers />,
      link: "/admin/customers",
      label: "View customers",
      className: "customers",
    },
    {
      title: "Categories",
      description: "Organise products into easy-to-browse collections.",
      icon: <FiTag />,
      link: "/admin/categories",
      label: "Manage categories",
      className: "categories",
    },
  ];

  const quickActions = [
    {
      title: "Add a product",
      description: "Create a new product listing",
      icon: <FiPlus />,
      link: "/admin/products?add=true",
    },
    {
      title: "Review feedback",
      description: "View customer product reviews",
      icon: <FiMessageSquare />,
      link: "/admin/reviews",
    },
    {
      title: "Order management",
      description: "Open your order workspace",
      icon: <FiDollarSign />,
      link: "/admin/orders",
    },
  ];

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard-inner">
        {/* PAGE HEADER */}
        <header className="admin-page-header">
          <div className="admin-page-heading">
            <div className="admin-eyebrow">
              <span className="admin-eyebrow-icon">
                <FiActivity />
              </span>
              STORE MANAGEMENT
            </div>

            <h1>
              Dashboard<span>.</span>
            </h1>

            <p>
              Welcome back! Here is an overview of your Online Bazaar store.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={() => fetchStatistics(true)}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "admin-spin" : ""} />
            <span>{loading ? "Loading..." : "Refresh data"}</span>
          </button>
        </header>

        {/* ERROR STATE */}
        {error && (
          <div className="admin-dashboard-error" role="alert">
            <div>
              <strong>Unable to load dashboard</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchStatistics(true)}
              disabled={loading}
            >
              Try again
            </button>
          </div>
        )}

        {/* REVENUE AND STATISTICS */}
        <section className="admin-overview-section">
          <div className="admin-section-intro">
            <div>
              <span className="admin-section-kicker">AT A GLANCE</span>
              <h2>Your store overview</h2>
            </div>

            <span className="admin-live-label">
              <span />
              Store statistics
            </span>
          </div>

          <div className="admin-statistics-layout">
            <article className="admin-revenue-card">
              <div className="admin-revenue-decoration admin-decoration-one" />
              <div className="admin-revenue-decoration admin-decoration-two" />

              <div className="admin-revenue-top">
                <div>
                  <span className="admin-revenue-label">TOTAL REVENUE</span>
                  <p>Overall store revenue</p>
                </div>

                <div className="admin-revenue-icon">
                  <FiTrendingUp />
                </div>
              </div>

              <div className="admin-revenue-amount">
                <span>₹</span>
                <strong>
                  {loading ? "—" : formatRevenue(statistics.totalRevenue)}
                </strong>
              </div>

              <div className="admin-revenue-bottom">
                <span className="admin-revenue-indicator">
                  <span />
                  Revenue overview
                </span>

                <Link to="/admin/orders">
                  View orders <FiArrowUpRight />
                </Link>
              </div>
            </article>

            <div className="admin-statistics-cards">
              {statCards.map((stat) => (
                <article
                  className={`admin-stat-card admin-stat-${stat.className}`}
                  key={stat.label}
                >
                  <div className="admin-stat-card-top">
                    <span>{stat.label}</span>
                    <div className="admin-stat-icon">{stat.icon}</div>
                  </div>

                  <strong className="admin-stat-value">
                    {loading ? "—" : formatNumber(stat.value)}
                  </strong>

                  <div className="admin-stat-card-bottom">
                    <span>{stat.description}</span>
                    <Link to={stat.link} aria-label={stat.linkLabel}>
                      <FiArrowUpRight />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* MANAGEMENT */}
        <section className="admin-management-section">
          <div className="admin-section-intro">
            <div>
              <span className="admin-section-kicker">YOUR WORKSPACE</span>
              <h2>Manage your store</h2>
              <p>Everything you need to run your business, in one place.</p>
            </div>
          </div>

          <div className="admin-management-grid">
            {managementCards.map((item, index) => (
              <Link
                to={item.link}
                className={`admin-management-card admin-management-${item.className}`}
                key={item.title}
              >
                <div className="admin-management-card-top">
                  <span className="admin-management-index">0{index + 1}</span>

                  <span className="admin-management-icon">{item.icon}</span>

                  <FiArrowUpRight className="admin-management-arrow" />
                </div>

                <div className="admin-management-card-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <div className="admin-management-card-footer">
                  <span>{item.label}</span>
                  <FiArrowRight />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="admin-quick-section">
          <div className="admin-section-intro">
            <div>
              <span className="admin-section-kicker">SHORTCUTS</span>
              <h2>Quick actions</h2>
              <p>Jump straight into your next task.</p>
            </div>
          </div>

          <div className="admin-quick-grid">
            {quickActions.map((action) => (
              <Link
                to={action.link}
                className="admin-quick-action"
                key={action.title}
              >
                <span className="admin-quick-icon">{action.icon}</span>

                <span className="admin-quick-copy">
                  <strong>{action.title}</strong>
                  <small>{action.description}</small>
                </span>

                <FiArrowUpRight className="admin-quick-arrow" />
              </Link>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="admin-dashboard-footer">
          <div className="admin-footer-brand">
            <span className="admin-footer-mark">OB</span>
            <span>Online Bazaar</span>
          </div>

          <span>Store administration</span>
        </footer>
      </div>
    </main>
  );
}

export default Admin;
