import "./Admin.css";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiArrowUpRight,
  FiShoppingBag,
  FiUsers,
  FiPackage,
  FiPlus,
  FiGrid,
  FiRefreshCw,
} from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Admin() {
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     FETCH STATISTICS
     Used by Refresh button
  ========================================================= */

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${VITE_API_URL}/api/admin/statistics`);

      if (!response.ok) {
        throw new Error("Failed to load dashboard statistics");
      }

      const data = await response.json();

      console.log("Dashboard statistics:", data);

      setStatistics({
        totalRevenue: Number(data.revenue || 0),
        totalOrders: Number(data.orders || 0),
        totalUsers: Number(data.users || 0),
        totalProducts: Number(data.products || 0),
      });
    } catch (error) {
      console.error("Dashboard statistics error:", error);

      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadStatistics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${VITE_API_URL}/api/admin/statistics`);

        if (!response.ok) {
          throw new Error("Failed to load dashboard statistics");
        }

        const data = await response.json();

        console.log("Dashboard statistics:", data);

        if (!cancelled) {
          setStatistics({
            totalRevenue: Number(data.revenue || 0),
            totalOrders: Number(data.orders || 0),
            totalUsers: Number(data.users || 0),
            totalProducts: Number(data.products || 0),
          });
        }
      } catch (error) {
        console.error("Dashboard statistics error:", error);

        if (!cancelled) {
          setError("Failed to load dashboard statistics");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStatistics();

    return () => {
      cancelled = true;
    };
  }, []);

  const formattedRevenue = statistics.totalRevenue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard-inner">
        {/* HEADER */}

        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-eyebrow">HOME NEEDS / ADMIN</span>

            <h1>Good day, Admin.</h1>

            <p>Here is a quick overview of your store's performance.</p>
          </div>

          <button
            type="button"
            className="dashboard-refresh"
            onClick={fetchStatistics}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "is-loading" : ""} />

            <span>Refresh</span>
          </button>
        </section>

        {/* ERROR */}

        {error && <div className="dashboard-error">{error}</div>}

        {/* MAIN REVENUE */}

        <section className="dashboard-top-grid">
          <div className="revenue-card">
            <div className="revenue-card-top">
              <div>
                <span className="card-label">TOTAL REVENUE</span>

                <p className="revenue-caption">Overall store revenue</p>
              </div>

              <div className="revenue-icon">₹</div>
            </div>

            <div className="revenue-value">
              <span>₹</span>

              <strong>{loading ? "0.00" : formattedRevenue}</strong>
            </div>

            <Link to="/admin/orders" className="revenue-footer">
              <span>View order performance</span>

              <div className="revenue-arrow">
                <FiArrowUpRight />
              </div>
            </Link>
          </div>

          {/* SIDE METRICS */}

          <div className="mini-stats">
            <div className="mini-stat-card">
              <div className="mini-stat-content">
                <span>Total Orders</span>

                <strong>
                  {loading
                    ? "0"
                    : statistics.totalOrders.toLocaleString("en-IN")}
                </strong>

                <small>Orders received</small>
              </div>

              <div className="mini-stat-icon">
                <FiShoppingBag />
              </div>
            </div>

            <div className="mini-stat-card">
              <div className="mini-stat-content">
                <span>Total Customers</span>

                <strong>
                  {loading
                    ? "0"
                    : statistics.totalUsers.toLocaleString("en-IN")}
                </strong>

                <small>Registered customers</small>
              </div>

              <div className="mini-stat-icon">
                <FiUsers />
              </div>
            </div>
          </div>
        </section>

        {/* STORE OVERVIEW */}

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span>STORE OVERVIEW</span>
              <h2>Inventory & customers</h2>
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-card-header">
                <div className="overview-icon">
                  <FiPackage />
                </div>

                <span>PRODUCTS</span>
              </div>

              <strong>
                {loading
                  ? "0"
                  : statistics.totalProducts.toLocaleString("en-IN")}
              </strong>

              <p>Products currently available in your store.</p>
            </div>

            <div className="overview-card">
              <div className="overview-card-header">
                <div className="overview-icon">
                  <FiUsers />
                </div>

                <span>CUSTOMERS</span>
              </div>

              <strong>
                {loading ? "0" : statistics.totalUsers.toLocaleString("en-IN")}
              </strong>

              <p>Customers registered with HomeNeeds.</p>
            </div>

            <div className="overview-card">
              <div className="overview-card-header">
                <div className="overview-icon">
                  <FiShoppingBag />
                </div>

                <span>ORDERS</span>
              </div>

              <strong>
                {loading ? "0" : statistics.totalOrders.toLocaleString("en-IN")}
              </strong>

              <p>Total orders placed by your customers.</p>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span>QUICK ACTIONS</span>
              <h2>Manage your store</h2>
            </div>
          </div>

          <div className="quick-actions">
            <Link to="/admin/products?add=true" className="quick-action">
              <div className="quick-action-icon">
                <FiPlus />
              </div>

              <div>
                <strong>Add Product</strong>
                <span>Create a new store product</span>
              </div>

              <FiArrowUpRight className="quick-arrow" />
            </Link>

            <Link to="/admin/orders" className="quick-action">
              <div className="quick-action-icon">
                <FiShoppingBag />
              </div>

              <div>
                <strong>View Orders</strong>
                <span>Manage customer orders</span>
              </div>

              <FiArrowUpRight className="quick-arrow" />
            </Link>

            <Link to="/admin/products" className="quick-action">
              <div className="quick-action-icon">
                <FiPackage />
              </div>

              <div>
                <strong>Products</strong>
                <span>View and manage products</span>
              </div>

              <FiArrowUpRight className="quick-arrow" />
            </Link>

            <Link to="/admin/categories" className="quick-action">
              <div className="quick-action-icon">
                <FiGrid />
              </div>

              <div>
                <strong>Categories</strong>
                <span>Organise your products</span>
              </div>

              <FiArrowUpRight className="quick-arrow" />
            </Link>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="dashboard-footer">
          <span>HomeNeeds Store</span>
          <span>Admin Dashboard</span>
        </footer>
      </div>
    </main>
  );
}

export default Admin;
